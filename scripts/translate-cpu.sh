#! /bin/bash

CWD=$1
MODEL=$2
a=$3
b=$4

echo "Translating $a..to..$b";

for (( i=$a; $(( $a > $b ? i>=$b : i<=$b )); i=$(( $a > $b ? $i - 1 : $i + 1 )) ))
do
  IN="$CWD/$i"
  OUT="$CWD/$i.out"
  if [ -e "$IN" ]; then
    if [ ! -e $OUT ]; then
      echo "Translating $i...";
      python scripts/translate-cpu.py \
        -m $MODEL \
        -i $IN \
        -o $OUT;
    fi
  fi
done
