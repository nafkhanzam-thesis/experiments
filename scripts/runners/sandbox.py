import pickle

with open("data/outputs/tf-labse-distances.pkl", "rb") as f:
    distances = pickle.load(f)

print(distances.shape)
print(distances[:5])
