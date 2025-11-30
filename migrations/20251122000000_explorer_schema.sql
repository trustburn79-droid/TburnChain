-- Explorer Schema

CREATE TABLE IF NOT EXISTS blocks (
    number INTEGER PRIMARY KEY,
    hash TEXT NOT NULL,
    parent_hash TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    tx_count INTEGER NOT NULL,
    shard_id INTEGER NOT NULL,
    validator TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
    hash TEXT PRIMARY KEY,
    block_number INTEGER NOT NULL,
    from_addr TEXT NOT NULL,
    to_addr TEXT NOT NULL,
    value TEXT NOT NULL,
    gas_price TEXT NOT NULL,
    status TEXT NOT NULL,
    tx_type TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    FOREIGN KEY(block_number) REFERENCES blocks(number)
);

CREATE TABLE IF NOT EXISTS validators (
    address TEXT PRIMARY KEY,
    stake TEXT NOT NULL,
    power REAL NOT NULL,
    commission REAL NOT NULL,
    uptime REAL NOT NULL,
    status TEXT NOT NULL,
    type TEXT NOT NULL -- Foundation, Enterprise, Community
);

CREATE TABLE IF NOT EXISTS network_stats (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    height INTEGER NOT NULL,
    tps INTEGER NOT NULL,
    active_shards INTEGER NOT NULL,
    active_validators INTEGER NOT NULL,
    last_updated INTEGER NOT NULL
);

-- Seed Data
INSERT INTO network_stats (id, height, tps, active_shards, active_validators, last_updated)
VALUES (1, 1234567, 347892, 48, 1245, strftime('%s', 'now'))
ON CONFLICT(id) DO NOTHING;

INSERT INTO validators (address, stake, power, commission, uptime, status, type)
VALUES 
('0x7a8f...3d2e', '15.2M', 1.27, 5.0, 100.0, 'Active', 'Foundation'),
('0x9b4c...8a1f', '12.8M', 1.07, 7.0, 99.9, 'Active', 'Enterprise'),
('0x2c5d...4b9a', '11.5M', 0.96, 10.0, 99.8, 'Active', 'Community');

INSERT INTO blocks (number, hash, parent_hash, timestamp, tx_count, shard_id, validator)
VALUES
(1234567, '0xabc...', '0xdef...', strftime('%s', 'now') - 2, 5203, 12, '0x7a8f...3d2e'),
(1234566, '0xghi...', '0xjkl...', strftime('%s', 'now') - 5, 5198, 7, '0x9b4c...8a1f'),
(1234565, '0xmno...', '0xpqr...', strftime('%s', 'now') - 8, 5187, 23, '0x2c5d...4b9a');

INSERT INTO transactions (hash, block_number, from_addr, to_addr, value, gas_price, status, tx_type, timestamp)
VALUES
('0x7a8f...3d2e', 1234567, '0x7a8f...3d2e', '0x9b4c...8a1f', '100 BURN', '10 EMB', 'Success', 'Transfer', strftime('%s', 'now') - 2),
('0x2c5d...4b9a', 1234566, '0x2c5d...4b9a', 'Contract', '0.8 BURN', '10 EMB', 'Success', 'Contract Call', strftime('%s', 'now') - 5);
