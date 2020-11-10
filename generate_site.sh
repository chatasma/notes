#!/bin/bash

base_dir="$(pwd)"
target_dir="$(pwd)/public"
target_content="${target_dir}/content"

if [ -d $target_dir ]; then
    rm -r $target_dir
fi

mkdir $target_dir 
mkdir $target_content

course_list="<ul>\n"

cd content
for semester in */ ; do
    cd ${semester}
    mkdir "${target_content}/${semester}"
    echo "Semester: ${semester}"
    echo "----------"
    for course in */ ; do
        cd ${course}
        mkdir "${target_content}/${semester}/${course}"
        echo ""
        echo "Course: ${course}"
        echo "----------"
        echo ""
        for topic in */ ; do
            cd ${topic}
            mkdir "${target_content}/${semester}/${course}/${topic}"
            echo "Compiling ${topic}..."
            make html &> /dev/null
            if [ $? -ne 0 ]; then
                echo "There was an error compiling ${topic}. Exiting"
                exit 1
            else
                echo "Compiled successfully"
                cp "./out/index.html" "${target_content}/${semester}/${course}/${topic}/"
            fi
            cd ..
        done
        course_list="${course_list}  <li>${course}</li>\n"
        cd ..
    done
    cd ..
done

course_list="${course_list}</ul>"
welcome_page="${target_dir}/index.html"

echo -en $course_list > .tmp_1
course_list_file=$(realpath .tmp_1)

cd $base_dir

# Main page
node build/ ./templates/welcome.html ${course_list_file} ${welcome_page}
