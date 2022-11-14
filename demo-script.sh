#!/bin/zsh

files=( images/*.jpg )

for f in $files; do
  mv $f public/
  sleep 10
done
mv public/* images/
printf "Done!\n"
