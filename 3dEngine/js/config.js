let config = {
    worldBorder: 5e5, // граница мира
    m: 1, // метер юнитов
    weight: 1, // кг
}

config.km = config.m * 1e3;
config.worldBorder = config.km * 50;

export {config}