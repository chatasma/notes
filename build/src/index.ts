import { readFileSync, writeFileSync } from 'fs';
import {argv, exit} from 'process';

if (process.argv.length < 5) {
    exit(1);
}
const course_listing = new RegExp("\\$'.*'", "gi");

const data = readFileSync(argv[2], 'utf-8');
const replaceData = readFileSync(argv[3], 'utf-8');
writeFileSync(argv[4], data.replace(course_listing, replaceData));
