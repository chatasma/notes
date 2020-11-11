import fs from "fs";
import path from "path";
import csv_parser from 'csv-parse';
import {argv, exit} from 'process';

if (process.argv.length < 5) {
    exit(1);
}
// 1st argument, content dir
// 2nd argument, public dir

const contentPath = argv[2];
const publicPath = argv[3];
const templatesPath = argv[4];
const notesSubdirName = "notes";
const publicContentPath = path.join(publicPath, notesSubdirName);

interface ResourceIdentity {
    full_name: string;
    access_path: string;
}

interface Course extends ResourceIdentity {
    dir_name: string;
    topics: Topic[];
}

interface Topic extends ResourceIdentity {
    dir_name: string;
}
const courses : Course[] = [];

(async () => {
    const semesterNames = fs.readdirSync(contentPath, "utf-8");
    for (let semesterName of semesterNames) {
        const semesterPath = path.join(contentPath, semesterName);
        const semesterFileStat = fs.statSync(semesterPath);
        if (!semesterFileStat.isDirectory()) continue;
        const courseNames = fs.readdirSync(semesterPath, "utf-8");
        for (let courseName of courseNames) {
            const coursePath = path.join(semesterPath, courseName);
            const courseMetadataPath = path.join(coursePath, ".course_data")
            const course : Course = {full_name: courseName, dir_name: courseName, access_path: `${notesSubdirName}/${path.relative(semesterPath, coursePath)}`, topics: []};
            let courseMetadata : any = null;
            try {
                courseMetadata = await parseCSV(courseMetadataPath);
            } catch (e) {}
            if (courseMetadata != null) course.full_name = courseMetadata[0][1];
            const topicNames = fs.readdirSync(coursePath);
            for (let topicName of topicNames) {
                const topicPath = path.join(coursePath, topicName);
                const topicFileStat = fs.statSync(topicPath);
                if (!topicFileStat.isDirectory()) continue;
                const topicMetadataFilePath = path.join(topicPath, ".topic_data");
                let topic : Topic = {full_name: topicName, dir_name: topicName, access_path: path.relative(semesterPath, topicPath)};
                let topicMetadata : any = null;
                try {
                    topicMetadata = await parseCSV(topicMetadataFilePath);
                } catch (e) {}
                if (topicMetadata != null) topic.full_name = topicMetadata[0][1];
                course.topics.push(topic);
            }
            courses.push(course);
        }
    }

    const course_links = courses.map(mapIdentityToAnchor);
    const listed_course_links = makeHTMLList(course_links);

    const course_listing_pattern = new RegExp("\\$'COURSE_LISTING'", "gi");
    const course_name_pattern = new RegExp("\\$'COURSE_NAME'", "gi");
    const topics_list_pattern = new RegExp("\\$'TOPICS_LIST'", "gi");

    const welcomeFilePath = path.join(publicPath, "index.html");
    const welcomePageContent = fs.readFileSync(welcomeFilePath, 'utf-8');
    const replaceData = listed_course_links;
    fs.writeFileSync(welcomeFilePath, welcomePageContent.replace(course_listing_pattern, replaceData));

    for (let course of courses) {
        const coursePagePath = path.join(publicContentPath, course.dir_name, "index.html");
        let coursePageContent = fs.readFileSync(path.join(templatesPath, "course.html"), 'utf-8');
        coursePageContent = coursePageContent.replace(course_name_pattern, course.full_name);
        coursePageContent = coursePageContent.replace(topics_list_pattern, makeHTMLList(course.topics.map(mapIdentityToAnchor)));
        fs.writeFileSync(coursePagePath, coursePageContent);
    }
    // const topic_list : Topic[][] = courses.map((course) => course.topics);
    // console.log(makeHTMLList(flatten2D(topic_list).map(mapIdentityToAnchor)));
    // const flat_topic_list = [].concat(...courses.map((course) => course.topics));
})();

function flatten2D<T>(arr: T[][]) : T[] {
    let flattened : T[] = [];
    for (let elem of arr) {
        flattened = flattened.concat(elem);
    }
    return flattened;
}

function makeHTMLList(links: string[]) : string {
    return `<ul>${links.map((elem) => `<li>${elem}</li>`).reduce((a, c) => a + c, "")}</ul>`;
}


function mapIdentityToAnchor(identifier: ResourceIdentity) : string {
    return `<a href="${identifier.access_path}">${identifier.full_name}</a>`;
}

function parseCSV(filePath: string) {
    if (!fs.existsSync(filePath)) return null;
    const fileContent = fs.readFileSync(filePath);
    return new Promise((resolve, reject) => {
        csv_parser(fileContent, {comment: '#'}, (err, output) => {
            if (err) reject();
            else resolve(output);
        });
    });
}

// const course_listing = new RegExp("\\$'.*'", "gi");

// const data = fs.readFileSync(argv[2], 'utf-8');
// const replaceData = fs.readFileSync(argv[3], 'utf-8');
// fs.writeFileSync(argv[4], data.replace(course_listing, replaceData));
