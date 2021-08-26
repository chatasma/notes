.PHONY: default clean html pdf

default:
	Rscript -e "rmarkdown::render('index.Rmd', output_dir='out')"

html: index.Rmd
	Rscript -e "rmarkdown::render('index.Rmd', output_dir='out', output_format = 'html_document')"

pdf: index.Rmd
	Rscript -e "rmarkdown::render('index.Rmd', output_dir='out', output_format = 'pdf_document')"

clean:
	rm out/*.pdf out/*.html
