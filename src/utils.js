export function convertStringToJson(str) {
    const lines = str.split("\n");

    const result = [];

    const headers = lines[0].split(",");

    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentline = lines[i].split(",");

        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
        }

        result.push(obj);
    }

    return result;
}

export function convert2ElectionData(data) {
    const colsMap = {
        'STT': 'key',
        'HỌ VÀ TÊN': 'name',
        'NĂM SINH': 'birthday',
        'GIỚI TÍNH': 'gender'
    }
    const rows = [];
    let isValidColumn = true;

    data.forEach(row => {
        const result = {};
        let isValidData = true;
        Object.entries(row).forEach(([key, value]) => {
            if (!value) {
                isValidData = false;
            }

            if (!colsMap[(key || '').toUpperCase()]) {
                isValidColumn = false;
            }

            result[colsMap[(key || '').toUpperCase()]] = value;
            result.vote = 0;
        });

        if (isValidData) {
            rows.push(result);
        }
    });

    for (let i = rows.length + 1; i <= 100; i++) {
        rows.push({
            key: i.toString(),
            name: ``,
            birthday: '',
            gender: '',
            vote: 0
        })
    }

    return { data: rows, hasError: !isValidColumn };
}