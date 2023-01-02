import db
import pickle
import numpy as np
from tqdm import tqdm


DATA_SOURCE = 'LDC2020'
TOTAL = 1722+55635

# ~ Choose the column.
# COL = 'en__labse'
COL = 'id__labse'
# COL = 'en_alt__labse'
# COL = 'id_alt__labse'


if __name__ == "__main__":
    statement = db.session.prepare(
        f"SELECT {COL} FROM {db.SCYLLA_DB_TABLE} WHERE data_source=? AND split IN ('train', 'dev')")
    statement.fetch_size = 1000
    all = []
    for labse, in tqdm(db.session.execute(statement, (DATA_SOURCE,)), total=TOTAL):
        all.append(np.array(labse))

    with open(f"data/outputs/{COL}.pkl", "wb") as f:
        pickle.dump(all, f)
