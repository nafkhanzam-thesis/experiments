from transformers import MarianMTModel, MarianTokenizer


def create_translate_fn():
    model_name = "Helsinki-NLP/opus-mt-en-id"
    tokenizer = MarianTokenizer.from_pretrained(model_name)
    model = MarianMTModel.from_pretrained(model_name)

    def translate(en_text_list):
        translated = model.generate(max_new_tokens=512,
                                    **tokenizer(en_text_list, return_tensors="pt", padding=True))
        return [tokenizer.decode(t, skip_special_tokens=True) for t in translated]

    return translate


# src_text = [
#     f"this is a sentence in english that we want to translate to french",
#     f"This should go to portuguese",
#     f"And this to Spanish",
# ]

# print(create_translate_fn()(src_text))
