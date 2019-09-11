const exportUPIL = {}
export default exportUPIL

const MAIN_RUN = 'main'
const MAIN_DIALOG = 'mainDialog'

const exportScenarioAsUPIL = (scenarioArray) => {
    console.log(JSON.stringify(scenarioArray, null, 4))

    let upil = []
    for (let node of scenarioArray) {
        let { type, id, text } = node
        id = id.replace('-', '_')   // Should be fixed by BotEditor
        if (type === 'normal') {
            upil = upil.concat(createDialog(id, createTemplate(id, text)))
        }
    }
    const startId = getStartId(scenarioArray)
    upil = upil.concat(createDialog(MAIN_DIALOG, createCalls(startId, scenarioArray)))
    upil = upil.concat(createRun(MAIN_RUN, MAIN_DIALOG))

    console.log(pretty(upil))
}

const getStartId = (scenarioArray) => {
    const { id } = scenarioArray.find(node => {
        const { type } = node
        return type === 'start-point'
    })
    return id
}

const getNodeFromId = (nodeId, scenarioArray) => {
    return scenarioArray.find(node => {
        const { id } = node
        return id === nodeId
    })
}

const getIfPart = (conditions) => {
    const ifs = conditions.filter(condition => {
        const { type } = condition
        return type === 'custom_var'
    })
    return ifs[0]
}

const getElifParts = (conditions) => {
    const ifs = conditions.filter(condition => {
        const { type } = condition
        return type === 'custom_var'
    })
    return ifs.splice(1, ifs.length - 1)
}

const getElsePart = (conditions) => {
    const elsePart = conditions.filter(condition => {
        const { type } = condition
        return type === 'else'
    })
    return elsePart[0]
}

const createCalls = (nodeId, scenarioArray) => {
    let statements = []

    const node = getNodeFromId(nodeId, scenarioArray)
    if (node === undefined) {
        return []
    }

    let { id, type, conditions } = node

    conditions = conditions === undefined ? [] : conditions
    conditions = conditions.filter(condition => {
        const { type } = condition
        return type !== 'default'
    })
    // Workaround for BotEditor error
    conditions = conditions.filter(condition => {
        const { next } = condition
        const node = getNodeFromId(next, scenarioArray)
        return node !== undefined
    })

    switch (type) {
        case 'start-point': {
            switch (conditions.length) {
                case 0:
                    break
                case 1: {
                    const condition = conditions[0]
                    const { next, type } = condition
                    if (type === 'else') {
                        statements = statements.concat(createCalls(next, scenarioArray))
                    }
                }
                    break
                default: {
                    const ifPart = getIfPart(conditions)
                    const { next: ifNext } = ifPart
                    statements = statements.concat(createIf('', createCalls(ifNext, scenarioArray)))

                    const elifParts = getElifParts(conditions)
                    for (let condition of elifParts) {
                        const { next: elifNext } = condition
                        statements = statements.concat(createElif('', createCalls(elifNext, scenarioArray)))
                    }

                    const elsePart = getElsePart(conditions)
                    const { next: elseNext } = elsePart
                    statements = statements.concat(createElse(createCalls(elseNext, scenarioArray)))
                }
            }
        }
            break
        case 'normal': {
            switch (conditions.length) {
                case 0:
                    id = id.replace('-', '_')   // Should be fixed by BotEditor
                    statements = statements.concat(createCall(id))
                    break
                case 1: {
                    const condition = conditions[0]
                    const { next, type } = condition
                    if (type === 'else') {
                        statements = statements.concat(createCalls(next, scenarioArray))
                    }
                }
                    break
                default: {
                    const ifPart = getIfPart(conditions)
                    const { next: ifNext } = ifPart
                    statements = statements.concat(createIf('', createCalls(ifNext, scenarioArray)))

                    const elifParts = getElifParts(conditions)
                    for (let condition of elifParts) {
                        const { next: elifNext } = condition
                        statements = statements.concat(createElif('', createCalls(elifNext, scenarioArray)))
                    }

                    const elsePart = getElsePart(conditions)
                    const { next: elseNext } = elsePart
                    statements = statements.concat(createElse(createCalls(elseNext, scenarioArray)))
                }
            }
        }
            break
    }

    return statements
}

const createCall = (name) => {
    let statement = []
    statement.push(`...${name}`)
    return statement
}

const createDialog = (name, statements) => {
    let statement = []
    statement.push(`DIALOG ${name}`)
    statement = statement.concat(statements)
    statement.push('/DIALOG')
    return statement
}

const createIf = (condition, statements) => {
    let statement = []
    statement.push(`IF ${condition}`)
    statement = statement.concat(statements)
    return statement
}

const createElif = (condition, statements) => {
    let statement = []
    statement.push(`ELIF ${condition}`)
    statement = statement.concat(statements)
    return statement
}

const createElse = (statements) => {
    let statement = []
    statement.push('ELSE')
    statement = statement.concat(statements)
    statement.push('/IF')
    return statement
}

const createRun = (name, body) => {
    let statement = []
    statement.push(`RUN ${name}`)
    statement.push(`${body}`)
    statement.push('/RUN')
    return statement
}

const createTemplate = (name, body) => {
    let statement = []
    statement.push(`TEMPLATE ${name}`)
    statement.push(`"${body}"`)
    statement.push('/TEMPLATE')
    return statement
}

const pretty = (statements) => {
    const INDENT_AMOUNT = 2
    const indentLeft = (indent) => {
        return indent - INDENT_AMOUNT
    }
    const indentRight = (indent) => {
        return indent + INDENT_AMOUNT
    }

    const format = (indent, statement) => {
        return ' '.repeat(indent) + statement + '\n'
    }

    let upil = ''
    let indent = 0
    for (let statement of statements) {
        const firstWord = statement.split(' ')[0]
        switch (firstWord) {
            case 'DIALOG':
            case 'IF':
            case 'SELECT':
            case 'TEMPLATE':
            case 'RUN':
                upil += format(indent, statement)
                indent = indentRight(indent)
                break
            case 'ELIF':
            case 'ELSE':
                indent = indentLeft(indent)
                upil += format(indent, statement)
                indent = indentRight(indent)
                break
            case '/DIALOG':
            case '/IF':
            case '/SELECT':
            case '/TEMPLATE':
            case '/RUN':
                indent = indentLeft(indent)
                upil += format(indent, statement)
                break
            default:
                upil += format(indent, statement)
        }
    }
    return upil
}

window.exportScenarioAsUPIL = exportScenarioAsUPIL
