#! /bin/bash

echo "Translating $1..to..$2";

for (( i=$1;i<=$2;++i ))
do
  IN="outputs/ldc2020-train-dev+alternatives.en/$i"
  OUT="outputs/ldc2020-train-dev+alternatives.en/$i.out"
  if [ -f "$IN" ]; then
    if [ ! -f "$OUT" ]; then
      touch $OUT;
      echo "Translating $i...";
      python scripts/translate.py \
        -m en-id \
        -i $IN \
        -o $OUT;
    fi
  fi
done