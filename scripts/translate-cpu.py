import argparse
from transformers import MarianMTModel, MarianTokenizer


def create_translate_fn(model_name):
    tokenizer = MarianTokenizer.from_pretrained(model_name)
    model = MarianMTModel.from_pretrained(model_name)

    def translate(en_text_list):
        tokenizer_output = tokenizer(
            en_text_list, return_tensors="pt", padding=True)
        translated = model.generate(max_new_tokens=528,
                                    **tokenizer_output)
        return [tokenizer.decode(t, skip_special_tokens=True) for t in translated]

    return translate


model_map = {
    'en-id': 'Helsinki-NLP/opus-mt-en-id',
    'id-en': 'Helsinki-NLP/opus-mt-id-en',
}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        prog='ProgramName',
        description='What the program does',
        epilog='Text at the bottom of help')
    parser.add_argument('-i', '--input-file')
    parser.add_argument('-o', '--output-file')
    parser.add_argument('-m', '--model')
    args = parser.parse_args()

    with open(args.input_file) as f:
        content_list = f.readlines()

    content_list = [x.strip() for x in content_list]

    fn = create_translate_fn(model_map[args.model])
    result = fn(content_list)

    with open(args.output_file, "w") as fout:
        print(*result, sep="\n", end="", file=fout)
