import db
import argparse
from tqdm import tqdm
from eval.cosine_distance import cosine_distance

DATA_SOURCE = 'LDC2020'


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--split', required=True)
    # parser.add_argument('--t-data-source', required=True)
    # parser.add_argument('--t-split', required=True)
    parser.add_argument('--fetch-size', type=int, default=1000)
    parser.add_argument('--range-l', type=int, required=True)
    parser.add_argument('--range-r', type=int, required=True)
    args = parser.parse_args()

    def log(*msg):
        print(
            f"labse_distances | {DATA_SOURCE}-{args.split}-{i} |", *msg)

    for i in range(args.range_l, args.range_r):
        comp_statement = db.session.prepare(
            f"SELECT en__labse, id__labse, id__en__nn_rank FROM {db.SCYLLA_DB_TABLE} WHERE data_source=? AND split=? AND idx=?")
        en__labse, id__labse, id__en__nn_rank = db.session.execute(
            comp_statement, (DATA_SOURCE, args.split, i)).one()

        if id__en__nn_rank is not None:
            continue

        rank = 1
        compared_distance = cosine_distance(id__labse, en__labse)
        print("Calculating", DATA_SOURCE, args.split,
              i, "self-dist", compared_distance)

        statement = db.session.prepare(
            f"SELECT split, idx, en__labse FROM {db.SCYLLA_DB_TABLE} WHERE data_source=? AND split IN ('train', 'dev')")
        statement.fetch_size = args.fetch_size
        generator = tqdm(db.session.execute(statement, (DATA_SOURCE,)),
                         total=55635+1722)
        for split, idx, next_en__labse in generator:
            if i == idx:
                continue

            # print("calculating", args.split, i,
            #       "with", split, idx)

            distance = cosine_distance(id__labse, next_en__labse)
            # insert_statement = db.session.prepare(
            #     f"UPDATE labse_distances SET distance=?, en__data_source=?, en__split=?, en__idx=? WHERE data_source=? AND split=? AND idx=?")
            # db.session.execute(
            #     insert_statement, (distance, DATA_SOURCE, split, idx, DATA_SOURCE, args.split, i))
            # log(idx, "Inserted!", distance)

            # print("got", distance)

            if distance < compared_distance:
                rank += 1

        insert_statement = db.session.prepare(
            f"UPDATE {db.SCYLLA_DB_TABLE} SET id__en__nn_rank=? WHERE data_source=? AND split=? AND idx=?")
        db.session.execute(
            insert_statement, (rank, DATA_SOURCE, args.split, i))

        log("Inserted! Rank:", rank)
