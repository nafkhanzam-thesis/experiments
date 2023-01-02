import pickle
from datetime import datetime
from tqdm import tqdm
from eval.cosine_distance_batch import cosine_distance_batch


COL_A = 'id__labse'
COL_B_BATCH = 'en__labse'

# COL_A = 'id_alt__labse'
# COL_B_BATCH = 'en_alt__labse'

SAVED_RANK = ''
SAVED_RANK = 'data/outputs/ranks__id__labse-2023-01-02 19:46:16.437585.pkl'


if __name__ == "__main__":
    with open(f"data/outputs/{COL_A}.pkl", "rb") as f:
        A_list = pickle.load(f)

    with open(f"data/outputs/{COL_B_BATCH}.pkl", "rb") as f:
        B_batch = pickle.load(f)

    try:
        with open(SAVED_RANK, "rb") as f:
            ranks = pickle.load(f)
        print("Saved ranks found.")
    except:
        print("Starting from empty.")
        ranks = []

    try:
        for i, A in tqdm(enumerate(A_list), total=len(A_list)):
            if i < len(ranks):
                continue
            distances = list(enumerate(cosine_distance_batch(A, B_batch)))
            # distances = np.array([cosine_distance(A, B) for B in B_batch])
            distances.sort(key=lambda x: x[1])
            rank = 0
            for idx, _ in distances:
                rank += 1
                if i == idx:
                    break
            if rank > 1:
                print("Found lower rank:", rank)
            ranks.append(rank)
    finally:
        print("Saving ranks:", ranks[:5])
        with open(f"data/outputs/ranks__{COL_A}_len{len(ranks)}-{str(datetime.now())}.pkl", "wb") as f:
            pickle.dump(ranks, f)
