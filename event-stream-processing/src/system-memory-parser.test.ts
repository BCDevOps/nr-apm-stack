import {SystemMemoryParser} from './system-memory-parser'

test('basic', async () => {
    const filter = new SystemMemoryParser()
    const record = {
        event: {kind: "kind", dataset: "system.memory"},
        agent:{type: "fluentbit"},
        Mem:{total: 100, used: 50, free:50},
        Swap:{total: 100, used: 50, free:50},
    }
    filter.apply(record)
    expect(record).not.toHaveProperty('Mem.total')
    expect(record).not.toHaveProperty('Mem.used')
    expect(record).not.toHaveProperty('Mem.free')
    expect(record).not.toHaveProperty('Swap.total')
    expect(record).not.toHaveProperty('Swap.used')
    expect(record).not.toHaveProperty('Swap.free')
    expect(record).toHaveProperty('system.memory.total', 100)
    expect(record).toHaveProperty('system.memory.used.bytes', 50)
    expect(record).toHaveProperty('system.memory.used.pct', 0.5)
    expect(record).toHaveProperty('system.memory.free', 50)
    expect(record).toHaveProperty('system.memory.swap.total', 100)
    expect(record).toHaveProperty('system.memory.swap.used.bytes', 50)
    expect(record).toHaveProperty('system.memory.swap.used.pct', 0.5)
    expect(record).toHaveProperty('system.memory.swap.free', 50)
});
