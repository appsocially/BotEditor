const exportUPIL = {}
export default exportUPIL

const MAIN_RUN = 'main'
const MAIN_DIALOG = 'mainDialog'

const exportScenarioAsUPIL = (scenarioArray) => {
    console.log(JSON.stringify(scenarioArray, null, 4))

    let upil = []
    upil = upil.concat(createAllDialogs(scenarioArray))
    upil = upil.concat(createMainDialog(MAIN_DIALOG, scenarioArray))
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

const createAllDialogs = (scenarioArray) => {
    let upil = []

    for (let node of scenarioArray) {
        let { type, id, text, customVariable, selections } = node
        id = id.replace(/-/g, '_')   // Should be fixed by BotEditor
        switch (type) {
            case 'normal':
                upil = upil.concat(createDialog(id, createTemplate(id, text)))
                break
            case 'openquestion':
                upil = upil.concat(createDialog(id, createOpenQuestion(id, text, customVariable)))
                break
            case 'selection':
                upil = upil.concat(createDialog(id, createSelection(id, text, customVariable, selections)))
                break
            case 'goto':
            case 'start-point':
                // ignore
                break
            default:
                console.log(`Error: Unknown type ${type}`)
        }
    }

    return upil
}

const createMainDialog = (name, scenarioArray) => {
    let upil = []
    const startId = getStartId(scenarioArray)
    upil = upil.concat(createDialog(name, createCalls(startId, scenarioArray)))
    return upil
}

const cleanseConditions = (conditions) => {
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

    conditions = conditions.filter(condition => {
        const { type, option } = condition
        if (type === 'custom_var') {
            return option !== undefined
        }
        return true
    })

    return conditions
}

const createCalls = (nodeId, scenarioArray) => {
    let statements = []

    const node = getNodeFromId(nodeId, scenarioArray)
    if (node === undefined) {
        return []
    }

    let { id, type, conditions } = node

    conditions = cleanseConditions(conditions)

    switch (conditions.length) {
        case 0:
            statements = statements.concat(createCallIfRequired(type, id, scenarioArray))
            break
        case 1: // else
            statements = statements.concat(createCallSequence(type, id, conditions[0], scenarioArray))
            break
        default:
            statements = statements.concat(createIfCalls(conditions, scenarioArray))
    }

    return statements
}

const createCallIfRequired = (type, id, scenarioArray) => {
    let statements = []

    if (type === 'start-point') {
        // not required
        return []
    }
    if (type === 'goto') {
        // ignore - No equivalent construct in UPIL
        return []
    }

    let correctedId = id.replace(/-/g, '_')   // Should be fixed by BotEditor
    statements = statements.concat(createCall(correctedId))

    if (type === 'selection') {
        statements = statements.concat(createIfCallsForSelection(id, scenarioArray))
    }

    return statements
}

const createIfCallsForSelection = (id, scenarioArray) => {
    let statements = []

    const node = getNodeFromId(id, scenarioArray)
    const { customVariable, selections } = node

    let ifCallConditions = []
    for (const [index, selection] of selections.entries()) {
        const { conditions, label } = selection
        const ifCallCondition = index === 0 ? {
            type: 'else',
            next: conditions[0].next
        } : {
                type: 'custom_var',
                next: conditions[0].next,
                option: {
                    customVarName: customVariable.location,
                    operator: '==',
                    comparedValue: label
                }
            }
        ifCallConditions.push(ifCallCondition)
    }

    return statements.concat(createIfCalls(ifCallConditions, scenarioArray))
}

const createCallSequence = (type, id, condition, scenarioArray) => {
    let statements = []

    statements = statements.concat(createCallIfRequired(type, id))
    statements = statements.concat(createCalls(condition.next, scenarioArray))

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

const createIfCalls = (conditions, scenarioArray) => {
    let statements = []

    const ifPart = getIfPart(conditions)
    const { next: ifNext, option } = ifPart
    statements = statements.concat(createIf(option, createCalls(ifNext, scenarioArray)))

    const elifParts = getElifParts(conditions)
    for (let condition of elifParts) {
        const { next: elifNext, option } = condition
        statements = statements.concat(createElif(option, createCalls(elifNext, scenarioArray)))
    }

    const elsePart = getElsePart(conditions)
    const { next: elseNext } = elsePart
    statements = statements.concat(createElse(createCalls(elseNext, scenarioArray)))

    return statements
}

const createIf = (condition, statements) => {
    let statement = []
    const { customVarName: left, operator, comparedValue: right } = condition
    statement.push(`IF ${left} ${operator} "${right}"`)
    statement = statement.concat(statements)
    return statement
}

const createElif = (condition, statements) => {
    let statement = []
    const { customVarName: left, operator, comparedValue: right } = condition
    statement.push(`ELIF ${left} ${operator} "${right}"`)
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

const createOpenQuestion = (name, body, variable) => {
    const { location, varType } = variable
    let statement = []
    statement.push(`TEMPLATE ${name}`)
    statement.push(`"${body}"`)
    statement.push(`>>${location}:${varType.toLowerCase()}`)
    statement.push('/TEMPLATE')
    return statement
}

const createSelection = (name, body, variable, selections) => {
    const { location, varType } = variable
    let statement = []
    statement.push(`SELECT ${name}`)
    statement.push(`"${body}"`)
    for (const selection of selections) {
        const { label } = selection
        statement.push(`-("${label}", ${label})`)
    }
    statement.push(`>>${location}:${varType.toLowerCase()}`)
    statement.push('/SELECT')
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
