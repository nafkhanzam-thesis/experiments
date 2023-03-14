#! /bin/bash

CWD=$1
MODEL=$2
a=$3
b=$4

echo "Translating [$a, $b)";

for (( i=$a; i<$b; ++i ))
do
  IN="$CWD/$i.split"
  OUT="$CWD/$i.out"
  if [ -e "$IN" ]; then
    if [ ! -e $OUT ]; then
      echo "Translating $i...";
      python scripts/translate/translate.py \
        -m $MODEL \
        -i $IN \
        -o $OUT;
    fi
  fi
done
