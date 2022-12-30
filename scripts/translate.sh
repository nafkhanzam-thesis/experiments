#! /bin/bash

cwd=$1
a=$2
b=$3

echo "Translating $a..to..$b";

for (( i=$a; $(( $a > $b ? i>=$b : i<=$b )); i=$(( $a > $b ? $i - 1 : $i + 1 )) ))
do
  IN="$cwd/$i"
  OUT="$cwd/$i.out"
  if [ -e "$IN" ]; then
    if [ ! -e $OUT ]; then
      echo "Translating $i...";
      python scripts/translate.py \
        -m en-id \
        -i $IN \
        -o $OUT;
    fi
  fi
done