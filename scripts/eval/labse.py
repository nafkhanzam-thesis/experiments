import argparse
from sentence_transformers import SentenceTransformer, util


def encode_labse(sentences):
    model = SentenceTransformer('sentence-transformers/LaBSE')
    embeddings = model.encode(sentences)
    return embeddings


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-i', '--input-file')
    parser.add_argument('-o', '--output-file')
    args = parser.parse_args()

    with open(args.input_file) as f:
        sentences = f.readlines()

    sentences = [x.strip() for x in sentences]

    result = encode_labse(sentences)

    with open(args.output_file, "w") as fout:
        print(*result, sep="\n", end="", file=fout)
