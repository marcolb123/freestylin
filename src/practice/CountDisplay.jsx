import { usePractice, usePracticeBeat } from './practice-context';
import { COUNTS_PER_CYCLE, countNumber, isCount } from './scheduler';

const COUNTS = Array.from({ length: COUNTS_PER_CYCLE }, (_, i) => i + 1);

/**
 * The 8 counts, with the current one lit.
 *
 * Subscribes to the beat context only — see practice-context.js for why the
 * beat is kept separate from the controls.
 */
export default function CountDisplay() {
    const { subdivision, isRunning } = usePractice();
    const tick = usePracticeBeat();

    const current = tick === null ? null : countNumber(tick, subdivision);
    // On an "and" the number stays lit but softens, so the count still reads
    // as 1-8 rather than flickering through subdivisions.
    const onCount = tick === null ? false : isCount(tick, subdivision);

    return (
        <div className="count-display" role="group" aria-label="Count">
            {COUNTS.map((n) => {
                const active = isRunning && current === n;
                return (
                    <div
                        key={n}
                        className={`count-dot${active ? ' active' : ''}${active && !onCount ? ' offbeat' : ''}${n === 1 ? ' one' : ''}`}
                        aria-current={active ? 'true' : undefined}
                    >
                        {n}
                    </div>
                );
            })}
        </div>
    );
}
