import pickle
from tqdm import tqdm
from eval.cosine_distance_batch import cosine_distance_batch


if __name__ == "__main__":
    with open("data/outputs/en__labse.pkl", "rb") as f:
        B_batch = pickle.load(f)

    ranks = []
    for i, A in tqdm(enumerate(B_batch), total=len(B_batch)):
        distances = list(enumerate(cosine_distance_batch(A, B_batch)))
        # distances = np.array([cosine_distance(A, B) for B in B_batch])
        distances.sort(key=lambda x: x[1])
        rank = 0
        for idx, _ in distances:
            rank += 1
            if i == idx:
                break
        ranks.append(rank)

    with open("data/outputs/ranks.pkl", "wb") as f:
        pickle.dump(ranks, f)
