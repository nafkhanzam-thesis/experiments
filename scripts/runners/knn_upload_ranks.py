import db
import pickle
from tqdm import tqdm
from cassandra.query import BatchStatement

DATA_SOURCE = 'LDC2020'

# COL = 'id__en__nn_rank'
# RANK_PATH = 'data/outputs/ranks__id__labse_len57357.pkl'
COL = 'id_alt__en_alt__nn_rank'
RANK_PATH = 'data/outputs/ranks__id_alt__labse_len57357.pkl'


if __name__ == "__main__":
    with open(RANK_PATH, 'rb') as f:
        ranks = pickle.load(f)
    for split, target in [('dev', ranks[:1722]), ('train', ranks[1722:])]:
        batch = BatchStatement()
        print(f"Inserting {split} split...")
        for i, rank in tqdm(enumerate(target), total=len(target)):
            insert_statement = db.session.prepare(
                f"UPDATE {db.SCYLLA_DB_TABLE} SET {COL}=? WHERE data_source=? AND split=? AND idx=?")
            batch.add(insert_statement, (rank, DATA_SOURCE, split, i))
            if i % 1000 == 0:
                db.session.execute(batch)
                batch = BatchStatement()
        db.session.execute(batch)
