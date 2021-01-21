#!/bin/bash

function join_by { local IFS="$1"; shift; echo "$*"; }

base_dir="$(pwd)"
source_content="${base_dir}/content"
target_dir="$(pwd)/public"
target_content="${target_dir}/all"

selected_semesters=(4)

semesters_joined=$(join_by "," "${selected_semesters[@]}")
echo $semesters_joined
target_semesters=()
for semester_num in ${selected_semesters[@]} ; do
    target_semesters+=("sem${semester_num}")
done

# if [ -d $target_dir ]; then
#     rm -r $target_dir
# fi

mkdir -p $target_dir 
mkdir -p $target_content

cd ${source_content}
for semester in ${target_semesters[@]} ; do
    cd ${semester}
    echo "Semester: ${semester}"
    echo "----------"
    for course in */ ; do
        cd ${course}
        mkdir -p "${target_content}/${course}"
        echo ""
        echo "Course: ${course}"
        echo "----------"
        echo ""
        for topic in */ ; do
            cd ${topic}
            mkdir -p "${target_content}/${course}/${topic}"
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
node build/ ./content/ ./public/ ./templates/ ${semesters_joined}
