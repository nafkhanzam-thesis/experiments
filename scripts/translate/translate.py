import argparse
from transformers import MarianMTModel, MarianTokenizer


def assign_GPU(tokenizer_output):
    tokenizer_output['input_ids'] = tokenizer_output['input_ids'].to('cuda')
    # tokenizer_output['token_type_ids'] = tokenizer_output['token_type_ids'].to('cuda')
    tokenizer_output['attention_mask'] = tokenizer_output['attention_mask'].to('cuda')

    return tokenizer_output


def create_translate_fn(model_name):
    tokenizer = MarianTokenizer.from_pretrained(model_name)
    model = MarianMTModel.from_pretrained(model_name).to('cuda')

    def translate(en_text_list):
        tokenizer_output = tokenizer(
            en_text_list, return_tensors="pt", padding=True)
        tokenizer_output = assign_GPU(tokenizer_output)
        translated = model.generate(max_new_tokens=512, **tokenizer_output)
        return tokenizer.batch_decode(translated, skip_special_tokens=True)

    return translate


model_map = {
    'en-id': 'Helsinki-NLP/opus-mt-en-id',
    'id-en': 'Helsinki-NLP/opus-mt-id-en',
}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
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
