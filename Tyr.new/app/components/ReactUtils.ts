export function classNames(...classes: (string | object)[]): string {
    let classList: string[] = []

    for(let item of classes) {
        if (typeof item === 'string') {
            classList.push(item)
        } else {
            setClassNamesFromObject(item, classList)
        }
    }

    return classList.join(' ')
}

function setClassNamesFromObject(obj: object, classList: string[]) {
    for(let key in obj) {
        if (key) {
            // @ts-ignore
          let value = obj[key]
            if (value) {
                classList.push(key)
            }
        }
    }
}
