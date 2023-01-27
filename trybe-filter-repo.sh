#!/bin/bash

### GIT FILTER-REPO ###

 ## NÃO EXECUTE ESSE SCRIPT DIRETAMENTE
 ## Esse script foi feito para uso do
 ## script 'trybe-publisher' fornecido
 ## pela Trybe.

 [[ $# == 1 ]] && \
 [[ $1 == "trybe-security-parameter" ]] && \
 git filter-repo \
     --path .trybe \
     --path .github \
     --path .vscode \
     --path trybe.yml \
     --path tests/01-getAllTalkers.test.js \
     --path tests/02-getTalkerById.test.js \
     --path tests/03-login.test.js \
     --path tests/04-loginValidations.test.js \
     --path tests/05-createTalker.test.js \
     --path tests/06-editTalker.test.js \
     --path tests/07-deleteTalker.test.js \
     --path tests/08-searchTalker.test.js \
     --path tests \
     --path images/remote-container.png \
     --path images \
     --path README.md \
     --invert-paths --force --quiet
