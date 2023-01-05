git clone https://github.com/nafkhanzam-thesis/experiments.git
cd experiments
change .gitmodules to:
```
[submodule "xl-amr-id"]
        path = xl-amr-id
        url = https://github.com/nafkhanzam-thesis/xl-amr-id.git
[submodule "AMRBART"]
        path = AMRBART
        url = https://github.com/nafkhanzam-thesis/AMRBART.git
[submodule "AMR-Process"]
        path = AMR-Process
        url = https://github.com/nafkhanzam-thesis/AMR-Process.git
[submodule "transition-amr-parser"]
        path = transition-amr-parser
        url = https://github.com/nafkhanzam-thesis/transition-amr-parser.git
```
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
pushd models
git clone https://huggingface.co/facebook/mbart-large-50.git
popd
cd mbart-pre-train
python -m pip install pathlib ruamel-yaml
python -m pip install pillow-simd h5py-cache configargparse sacrebleu rouge-score datasets==2.4.0 transformers==4.21.3 nltk cached_property networkx penman>=1.1.0 pytorch-ignite regex smatch wandb amrlib PyYAML>=5.1
python -m pip install pillow scipy tqdm scikit-learn gensim tensorboard tensorboardX
pip install -v --no-cache-dir --global-option="--cpp_ext" --global-option="--cuda_ext" git+https://www.github.com/nvidia/apex
nano run.sh
copy paste run.sh content
chmod +x run.sh
bash run.sh
