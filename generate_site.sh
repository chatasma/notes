#!/bin/bash

base_dir="$(pwd)"
target_dir="$(pwd)/../notes_build"
target_content="${target_dir}/all"
target_semesters=("sem4")

# if [ -d $target_dir ]; then
#     rm -r $target_dir
# fi

mkdir $target_dir 
mkdir $target_content

cd content
for semester in ${target_semesters[@]} ; do
    cd ${semester}
    echo "Semester: ${semester}"
    echo "----------"
    for course in */ ; do
        cd ${course}
        mkdir "${target_content}/${course}"
        echo ""
        echo "Course: ${course}"
        echo "----------"
        echo ""
        for topic in */ ; do
            cd ${topic}
            mkdir "${target_content}/${course}/${topic}"
            echo "Compiling ${topic}..."
            make html &> /dev/null
            if [ $? -ne 0 ]; then
                echo "There was an error compiling ${topic}. Exiting"
                exit 1
            else
                echo "Compiled successfully"
                cp "./out/index.html" "${target_content}/${course}/${topic}/"
            fi
            cd ..
        done
        cd ..
    done
    cd ..
done

welcome_page="${target_dir}/index.html"
cd $base_dir

cp ./templates/welcome.html ${welcome_page}

# Main page
node build/ ./content/ ../notes_build/ ./templates/
