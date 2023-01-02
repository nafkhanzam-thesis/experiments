import db
import argparse
from eval.cosine_distance import cosine_distance


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--data-source', required=True)
    parser.add_argument('--split', required=True)
    parser.add_argument('--fetch-size', type=int, default=100)
    parser.add_argument('--range-l', type=int, required=True)
    parser.add_argument('--range-r', type=int, required=True)
    args = parser.parse_args()

    def log(*msg):
        print(
            f"labse_distance | {args.data_source}-{args.split}-{idx} |", *msg)

    statement = db.session.prepare(
        f"SELECT idx, en__labse, id__labse, labse_distance FROM {db.SCYLLA_DB_TABLE} WHERE data_source=? AND split=? AND idx>=? AND idx<?")
    statement.fetch_size = min(args.fetch_size, args.range_r - args.range_l)
    for idx, en__labse, id__labse, labse_distance in db.session.execute(statement, (args.data_source, args.split, args.range_l, args.range_r)):
        if labse_distance is not None:
            continue
        if en__labse is None:
            log("en__labse is null")
            continue
        if id__labse is None:
            log("id__labse is null")
            continue
        distance = cosine_distance(en__labse, id__labse)
        insert_statement = db.session.prepare(
            f"UPDATE {db.SCYLLA_DB_TABLE} SET labse_distance=? WHERE data_source=? AND split=? AND idx=?")
        db.session.execute(
            insert_statement, (distance, args.data_source, args.split, idx))
        log("Inserted! Distance:", distance)
