# Preprocessing scripts for ACL2022

ROOT=".."

for corpus in LDC2017 LDC2020
do
	OutPath=outputs/1-amr-process/${corpus}
	if [ ! -d ${OutPath} ];then
	  mkdir -p ${OutPath}
	fi
	for cate in training dev test
	do
		echo "Processing ${cate}..."
		pushd AMR-Process
		python read_and_process.py --config config-default.yaml --input_file ${ROOT}/data/${corpus}/data/amrs/split/${cate}/\*.txt --output_prefix ${ROOT}/${OutPath}/$cate
		popd
	done
done
