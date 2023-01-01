import db
import argparse
from eval.bleu import bleu_compute


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--data-source', required=True)
    parser.add_argument('--split', required=True)
    parser.add_argument('--fetch-size', default=10)
    parser.add_argument('--range-l', type=int, required=True)
    parser.add_argument('--range-r', type=int, required=True)
    args = parser.parse_args()

    def log(idx, *msg):
        print(f"{data_source}-{split}-{idx} |", *msg)

    query = f"SELECT data_source, split, idx, en, en_alt, en__en_alt__bleu FROM {db.SCYLLA_DB_TABLE} WHERE data_source=? AND split=? AND idx>=? AND idx<?"
    statement = db.session.prepare(query)
    statement.fetch_size = args.fetch_size
    for data_source, split, idx, en, en_alt, en__en_alt__bleu in db.session.execute(statement, (args.data_source, args.split, args.range_l, args.range_r)):
        if en__en_alt__bleu is not None:
            continue
        if en is None:
            log(idx, "en is null")
            continue
        if en_alt is None:
            log(idx, "en_alt is null")
            continue
        score = bleu_compute([en], [en_alt])
        print(en)
        print(en_alt)
        log(idx, "BLEU score is", score)
