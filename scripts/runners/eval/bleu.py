import evaluate
import argparse

bleu = evaluate.load("sacrebleu")


def bleu_compute(reference, hypothesis):
    reference = [[itm.strip()] for itm in reference]
    hypothesis = [itm.strip() for itm in hypothesis]
    res = bleu.compute(predictions=hypothesis, references=reference)
    return res['score']


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-rf', '--reference-file')
    parser.add_argument('-hf', '--hypothesis-file')
    parser.add_argument('-o', '--output-file')
    parser.add_argument('-a', '--all', default=False, action='store_true')
    args = parser.parse_args()

    with open(args.reference_file) as f:
        reference = f.readlines()

    with open(args.hypothesis_file) as f:
        hypothesis = f.readlines()

    if args.all:
        result = [bleu_compute(reference, hypothesis)]
    else:
        length = len(reference)
        assert length == len(hypothesis)
        result = [bleu_compute([reference[i]], [hypothesis[i]])
                  for i in range(length)]

    with open(args.output_file, "w") as fout:
        print(*result, sep="\n", end="", file=fout)
