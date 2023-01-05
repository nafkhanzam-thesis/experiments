git clone https://github.com/NVIDIA/apex
cd apex
python -m pip install -v --disable-pip-version-check --no-cache-dir --global-option="--cpp_ext" --global-option="--cuda_ext" ./
cd ..
git clone https://github.com/nafkhanzam-thesis/experiments.git
cd experiments
git submodule init
git submodule sync
git submodule update
cd AMRBART
python -m pip install gdown
gdown 1oFKrRe_v9qz8_toqzH65Z5Nqari9NDdg
mkdir datasets
mkdir models
sudo apt install unzip
unzip amrbart.zip -d datasets
curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash
sudo apt-get install git-lfs
git lfs install
pushd models
git clone https://huggingface.co/facebook/mbart-large-50.git
popd
cd mbart-pre-train
python -m pip install --user pathlib ruamel-yaml
python -m pip install --user pillow-simd h5py-cache configargparse sacrebleu rouge-score datasets==2.4.0 transformers==4.21.3 nltk cached_property networkx penman>=1.1.0 pytorch-ignite regex smatch wandb amrlib PyYAML>=5.1
python -m pip install --user pillow scipy tqdm scikit-learn gensim tensorboard tensorboardX
python -m pip install --user sentencepiece sentence-transformers
bash run.sh
