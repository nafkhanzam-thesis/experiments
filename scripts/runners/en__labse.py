import db
import argparse
from eval.labse import encode_labse


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--data-source', required=True)
    parser.add_argument('--split', required=True)
    parser.add_argument('--fetch-size', type=int, default=100)
    parser.add_argument('--range-l', type=int, required=True)
    parser.add_argument('--range-r', type=int, required=True)
    args = parser.parse_args()

    def log(idx, *msg):
        print(f"en__labse | {data_source}-{split}-{idx} |", *msg)

    statement = db.session.prepare(
        f"SELECT data_source, split, idx, en, en__labse FROM {db.SCYLLA_DB_TABLE} WHERE data_source=? AND split=? AND idx>=? AND idx<?")
    statement.fetch_size = min(args.fetch_size, args.range_r - args.range_l)
    for data_source, split, idx, en, en__labse in db.session.execute(statement, (args.data_source, args.split, args.range_l, args.range_r)):
        if en__labse is not None:
            continue
        if en is None:
            log(idx, "en is null")
            continue
        embeddings = encode_labse([en])[0]
        insert_statement = db.session.prepare(
            f"UPDATE {db.SCYLLA_DB_TABLE} SET en__labse=? WHERE data_source=? AND split=? AND idx=?")
        db.session.execute(
            insert_statement, (embeddings, args.data_source, args.split, idx))
        log(idx, "Inserted!", embeddings[:5])
