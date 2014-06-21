iD.data = {
    load: function(path, callback) {
        if (!callback) {
            callback = path;
            path = '';
        }
        iD.util.asyncMap([
            path + 'data/deprecated.json',
            path + 'data/discarded.json',
            path + 'data/imagery.json',
            path + 'data/wikipedia.json',
            path + 'data/presets/presets.json',
            path + 'data/presets/defaults.json',
            path + 'data/presets/categories.json',
            path + 'data/presets/fields.json',
            path + 'data/feature-icons.json',
            path + 'data/operations-sprite.json',
            path + 'data/locales.json',
            path + 'dist/locales/en.json',
            path + 'data/address-formats.json',
            path + 'dist/tiles/worldgrid.json'
            ], d3.json, function (err, data) {

            iD.data = {
                deprecated: data[0],
                discarded: data[1],
                imagery: data[2],
                wikipedia: data[3],
                presets: {
                    presets: data[4],
                    defaults: data[5],
                    categories: data[6],
                    fields: data[7]
                },
                featureIcons: data[8],
                operations: data[9],
                locales: data[10],
                en: data[11],
                addressFormats: data[12],
                worldGrid: data[13]
            };

            callback();
        });
    }
};
