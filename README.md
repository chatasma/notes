# Notes 

Requirements to build:
- R (with R Markdown)
- Pandoc
- NodeJS
- GNU Make
- Bash

To build:

```
cd build
yarn install # or npm
tsc # if ts not globally installed, ./node_modules/.bin/tsc
cd ..
./generate_site.sh
```

HTML output in `public` directory. Can be served using the following example
```
yarn global add serve # or npm
cd public
serve
```

[My Notes](https://chatasma.github.io/notes/)
