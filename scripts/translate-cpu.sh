#! /bin/bash

echo "Translating $1..to..$2";

for (( i=$1; $(( $1 > $2 ? i>=$2 : i<=$2 )); i=$(( $1 > $2 ? $i - 1 : $i + 1 )) ))
do
  IN="outputs/ldc2020-train-dev+alternatives.en/$i"
  OUT="outputs/ldc2020-train-dev+alternatives.en/$i.out"
  if [ -e "$IN" ]; then
    if [ ! -e $OUT ]; then
      echo "Translating $i...";
      python scripts/translate-cpu.py \
        -m en-id \
        -i $IN \
        -o $OUT;
    fi
  fi
done
