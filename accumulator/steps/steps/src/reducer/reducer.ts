import { Rollup, RollupProof, RollupState, Processor } from '../common';

const onNewLine = async (
  line: string,
  accumulatedProof: RollupProof,
): Promise<RollupProof> => {
  const [, proofString] = line.split('\t');

  const proof = RollupProof.fromJSON(JSON.parse(proofString));

  if (!accumulatedProof) {
    return proof;
  }

  const currentState = new RollupState({
    hashedSum: accumulatedProof.publicInput.hashedSum,
    sum: accumulatedProof.publicInput.sum,
  });

  const newState = RollupState.createMerged(
    currentState,
    new RollupState({
      hashedSum: proof.publicInput.hashedSum,
      sum: proof.publicInput.sum,
    }),
  );

  console.log('REDUCER MERGING');

  accumulatedProof = await Rollup.merge(newState, accumulatedProof, proof);

  console.log(
    'REDUCER ACCUMULATED PROOF:',
    JSON.stringify(accumulatedProof.toJSON()),
  );

  return accumulatedProof;
};

const onClosed = async (accumulatedProof: RollupProof): Promise<void> => {
  const accumulatedProofString = JSON.stringify(accumulatedProof.toJSON());
  process.stdout.write(accumulatedProofString);
  return;
};

export const reducer = async (): Promise<void> => {
  await Rollup.compile();
  const processor = new Processor<RollupProof>(onNewLine, onClosed);
  await processor.run();
};
