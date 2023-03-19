git clone https://github.com/nafkhanzam-thesis/AMRBART.git
cd AMRBART
wget https://storage.nafkhanzam.com/thesis/backups/amrbart.tar.gz
mkdir datasets
tar -xzvf amrbart.tar.gz -C datasets
mkdir models
curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash
sudo apt-get install git-lfs
git lfs install
pushd models
wget https://storage.nafkhanzam.com/thesis/backups/checkpoint-amrbart-old-100000.tar.gz
tar -xzvf checkpoint-amrbart-old-100000.tar.gz
mv checkpoint-last-255.759/ pre-trained-amrbart-old-100000/
popd
cd mbart-pre-train
python -m pip install --user pathlib ruamel-yaml
python -m pip install --user pillow-simd h5py-cache configargparse sacrebleu rouge-score datasets==2.4.0 transformers==4.21.3 nltk cached_property networkx penman>=1.1.0 pytorch-ignite regex smatch wandb amrlib PyYAML>=5.1
python -m pip install --user pillow scipy tqdm scikit-learn gensim tensorboard tensorboardX
python -m pip install --user sentencepiece sentence-transformers
bash run.sh
