import db
import argparse
from eval.bleu import bleu_compute


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--data-source', required=True)
    parser.add_argument('--split', required=True)
    parser.add_argument('--fetch-size', type=int, default=100)
    parser.add_argument('--range-l', type=int, required=True)
    parser.add_argument('--range-r', type=int, required=True)
    args = parser.parse_args()

    def log(idx, *msg):
        print(
            f"en_alt__en_alt_back__bleu | {data_source}-{split}-{idx} |", *msg)

    statement = db.session.prepare(
        f"SELECT data_source, split, idx, en_alt, en_alt_back, en_alt__en_alt_back__bleu FROM {db.SCYLLA_DB_TABLE} WHERE data_source=? AND split=? AND idx>=? AND idx<?")
    statement.fetch_size = args.fetch_size
    for data_source, split, idx, en_alt, en_alt_back, en_alt__en_alt_back__bleu in db.session.execute(statement, (args.data_source, args.split, args.range_l, args.range_r)):
        if en_alt__en_alt_back__bleu is not None:
            continue
        if en_alt is None:
            log(idx, "en_alt is null")
            continue
        if en_alt_back is None:
            log(idx, "en_alt_back is null")
            continue
        score = bleu_compute([en_alt], [en_alt_back])
        insert_statement = db.session.prepare(
            f"UPDATE {db.SCYLLA_DB_TABLE} SET en_alt__en_alt_back__bleu=? WHERE data_source=? AND split=? AND idx=?")
        db.session.execute(
            insert_statement, (score, args.data_source, args.split, idx))
        log(idx, "Inserted!", "BLEU score is", score)
