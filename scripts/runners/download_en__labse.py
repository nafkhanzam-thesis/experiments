import db
import pickle
import numpy as np
from tqdm import tqdm


DATA_SOURCE = 'LDC2020'
TOTAL = 1722+55635


if __name__ == "__main__":
    statement = db.session.prepare(
        f"SELECT en__labse FROM {db.SCYLLA_DB_TABLE} WHERE data_source=? AND split IN ('train', 'dev')")
    statement.fetch_size = 1000
    all = []
    for en__labse, in tqdm(db.session.execute(statement, (DATA_SOURCE,)), total=TOTAL):
        all.append(np.array(en__labse))

    with open("data/outputs/en__labse.pkl", "wb") as f:
        pickle.dump(all, f)
