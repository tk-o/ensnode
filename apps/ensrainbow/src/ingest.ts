import { createReadStream } from 'fs';
import { createGunzip } from 'zlib';
import { createInterface } from 'readline';
import { ClassicLevel } from 'classic-level';
import ProgressBar from 'progress';
import { join } from 'path';

const DATA_DIR = process.env.DATA_DIR || join(process.cwd(), 'data');
const INPUT_FILE = process.env.INPUT_FILE || join(process.cwd(), 'ens_names.sql.gz');

async function loadEnsNamesToLevelDB(): Promise<void> {
    // Initialize LevelDB
    const db = new ClassicLevel(DATA_DIR, {
        valueEncoding: 'utf8',
        keyEncoding: 'utf8'  // Store keys as hex strings to avoid Buffer issues
    });

    const TOTAL_LINES = 140_000_000; // Approximate total lines
    const bar = new ProgressBar('Processing [:bar] :current/:total lines (:percent) - :rate lines/sec - :etas remaining', {
        complete: '=',
        incomplete: ' ',
        width: 40,
        total: TOTAL_LINES
    });

    // Create a read stream for the gzipped file
    const fileStream = createReadStream(INPUT_FILE);
    const gunzip = createGunzip();
    const rl = createInterface({
        input: fileStream.pipe(gunzip),
        crlfDelay: Infinity
    });

    let isCopySection = false;
    let batch = db.batch();
    let batchSize = 0;
    const MAX_BATCH_SIZE = 10000;

    console.log('Loading data into LevelDB...');

    for await (const line of rl) {
        if (line.startsWith('COPY public.ens_names')) {
            isCopySection = true;
            continue;
        }

        if (line.startsWith('\\.')) {
            break;
        }

        if (isCopySection) {
            const parts = line.trim().split('\t');
            if (parts.length === 2) {
                const [hashVal, name] = parts;
                if (hashVal && name) {
                    try {
                        // Store the hash as a hex string
                        batch.put(hashVal, name);
                        batchSize++;

                        if (batchSize >= MAX_BATCH_SIZE) {
                            await batch.write();
                            batch = db.batch();
                            batchSize = 0;
                        }
                        bar.tick();
                    } catch (e) {
                        console.error(`Error processing hash: ${e} '${hashVal}'`);
                    }
                }
            }
        }
        else {
            bar.tick();
        }
    }

    // Write any remaining entries
    if (batchSize > 0) {
        await batch.write();
    }

    await db.close();
    console.log('\nData loading complete!');
}

if (require.main === module) {
    loadEnsNamesToLevelDB()
        .then(() => console.log('Done!'))
        .catch(console.error);
} 