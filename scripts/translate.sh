for i in {1..10000}
do
  IN="outputs/ldc2020-train-dev+alternatives.en/$i"
  OUT="outputs/ldc2020-train-dev+alternatives.en/$i.out"
  if [ -f "$IN" ]; then
    if [ ! -f "$OUT" ]; then
      python scripts/translate.py \
        -m en-id \
        -i $IN \
        -o $OUT;
    fi
  fi
done