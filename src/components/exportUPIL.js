const exportUPIL = {}
export default exportUPIL

const MAIN_RUN = 'main'
const MAIN_DIALOG = 'mainDialog'

const exportScenarioAsUPIL = (scenarioArray) => {
    console.log(JSON.stringify(scenarioArray, null, 4))

    const gotoTargets = getGotoTargets(scenarioArray)
    console.log(JSON.stringify(gotoTargets, null, 4))

    const entities = createMainDialog(MAIN_DIALOG, scenarioArray)
    console.log(JSON.stringify(entities, null, 4))

    const dialogs = extractDialogsForGoto(entities[0], gotoTargets)
    console.log('dialogs', JSON.stringify(dialogs, null, 4))

    let upil = []
    upil = upil.concat(createAllDialogs(scenarioArray))
    upil = upil.concat(createGotoTargetDialogs(dialogs))
    upil = upil.concat(createMainDialogString(MAIN_DIALOG, entities))
    upil = upil.concat(createRun(MAIN_RUN, MAIN_DIALOG))

    console.log(pretty(upil))

    return upil
}

const getGotoTargets = (scenarioArray) => {
    const targets = new Set()

    for (const node of scenarioArray) {
        const { type, toId } = node
        if (type === 'goto') {
            targets.add(toId.replace(/-/g, '_'))
        }
    }

    return [...targets]
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
        let { type, id, text, customVariable, selections, toId } = node
        id = id.replace(/-/g, '_')   // Should be fixed by BotEditor
        switch (type) {
            case 'normal':
                upil = upil.concat(createDialogString(id, createTemplateString(id, text)))
                break
            case 'openquestion':
                upil = upil.concat(createDialogString(id, createOpenQuestionString(id, text, customVariable)))
                break
            case 'selection':
                upil = upil.concat(createDialogString(id, createSelectionString(id, text, customVariable, selections)))
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

const createMainDialogString = (name, entities) => {
    console.log('entities:', JSON.stringify(entities, null, 4))
    let upil = []
    const entityStrings = createStatementStrings(entities[0].statements)
    upil = upil.concat(createDialogString(name, entityStrings))
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

    let { id, type, conditions, toId } = node

    conditions = cleanseConditions(conditions)

    statements = statements.concat(createCallIfRequired(type, id, toId, scenarioArray))
    switch (conditions.length) {
        case 0:
            // Do nothing
            break
        case 1: // else
            statements = statements.concat(createCalls(conditions[0].next, scenarioArray))
            break
        default:
            statements = statements.concat(createIfCalls(conditions, scenarioArray))
    }

    return statements
}

const createCallIfRequired = (type, id, toId, scenarioArray) => {
    let statements = []

    if (type === 'start-point') {
        // not required
        return []
    }

    let correctedId = id.replace(/-/g, '_')   // Should be fixed by BotEditor

    if (type === 'goto') {
        toId = toId.replace(/-/g, '_')   // Should be fixed by BotEditor
        statements = statements.concat(createGoto(correctedId, toId))
    } else {
        statements = statements.concat(createCall(correctedId))
        if (type === 'selection') {
            statements = statements.concat(createIfCallsForSelection(id, scenarioArray))
        }
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

const createGoto = (name, toId) => {
    let statement = []
    statement.push({
        type: 'goto',
        name,
        toId
    })
    return statement
}

const createGotoString = (name, toId) => {
    let statement = []
    toId = toId.replace(/-/g, '_')   // Should be fixed by BotEditor
    statement.push(`...goto_target_${toId}`)
    return statement
}

const createCall = (name) => {
    let statement = []
    statement.push({
        type: 'embed',
        name
    })
    return statement
}

const createCallString = (name) => {
    let statement = []
    statement.push(`...${name}`)
    return statement
}

const createDialog = (name, statements) => {
    let statement = []
    statement.push({
        type: 'dialog',
        name,
        statements
    })
    return statement
}

const createDialogString = (name, statements) => {
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
    statement.push({
        type: 'if',
        left,
        operator,
        right,
        statements
    })

    return statement
}

const createElif = (condition, statements) => {
    let statement = []

    const { customVarName: left, operator, comparedValue: right } = condition
    statement.push({
        type: 'elif',
        left,
        operator,
        right,
        statements
    })

    return statement
}

const createElse = (statements) => {
    let statement = []

    statement.push({
        type: 'else',
        statements
    })

    return statement
}

const createIfString = (condition, statements) => {
    let statement = []
    const { customVarName: left, operator, comparedValue: right } = condition
    statement.push(`IF ${left} ${operator} "${right}"`)
    statement.push('DIALOG')
    statement = statement.concat(createStatementStrings(statements))
    statement.push('/DIALOG')
    return statement
}

const createElifString = (condition, statements) => {
    let statement = []
    const { customVarName: left, operator, comparedValue: right } = condition
    statement.push(`ELIF ${left} ${operator} "${right}"`)
    statement.push('DIALOG')
    statement = statement.concat(createStatementStrings(statements))
    statement.push('/DIALOG')
    return statement
}

const createElseString = (statements) => {
    let statement = []
    statement.push('ELSE')
    statement.push('DIALOG')
    statement = statement.concat(createStatementStrings(statements))
    statement.push('/DIALOG')
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

const createTemplateString = (name, body) => {
    let statement = []
    statement.push(`TEMPLATE ${name}`)
    statement.push(`"${body}"`)
    statement.push('/TEMPLATE')
    return statement
}

const createOpenQuestionString = (name, body, variable) => {
    const { location, varType } = variable
    let statement = []
    statement.push(`TEMPLATE ${name}`)
    statement.push(`"${body}"`)
    statement.push(`>>${location}:${varType.toLowerCase()}`)
    statement.push('/TEMPLATE')
    return statement
}

const createSelectionString = (name, body, variable, selections) => {
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

const createStatementStrings = (statements) => {
    let statementStrings = []

    for (const statement of statements) {
        const { type, name, toId, left, operator, right, statements: stats } = statement
        const condition = {
            customVarName: left,
            operator,
            comparedValue: right
        }
        switch (type) {
            case 'embed':
                statementStrings = statementStrings.concat(createCallString(name))
                break
            case 'goto':
                statementStrings = statementStrings.concat(createGotoString(name, toId))
                break
            case 'if':
                statementStrings = statementStrings.concat(createIfString(condition, stats))
                break
            case 'elif':
                statementStrings = statementStrings.concat(createElifString(condition, stats))
                break
            case 'else':
                statementStrings = statementStrings.concat(createElseString(stats))
                break
            default:
                console.log(`Unknown entity type: ${type}`)
        }
    }

    return statementStrings
}

const createGotoTargetDialogs = (dialogs) => {
    let entityStrings = []

    for (const dialog of dialogs) {
        const { name, statements } = dialog
        statements = createStatementStrings(statements)
        entityStrings = entityStrings.concat(createDialogString(name, statements))
    }

    return entityStrings
}

const extractADialog = (statements, target) => {
    let dialog = {}
    let inDialog = false
    for (const statement of statements) {
        if (inDialog) {
            dialog.statements.push(statement)
        } else {
            const { type, name, statements: stats } = statement
            if (type === 'embed' && name === target) {
                inDialog = true
                dialog = {
                    type: 'dialog',
                    name: `goto_target_${name}`,
                    statements: [statement]
                }
            } else if (['if', 'elif', 'else'].includes(type)) {
                const aDialog = extractADialog(stats, target)
                if (Object.keys(aDialog).length > 0) {
                    return aDialog
                }
            }
        }
    }
    return dialog
}

const extractDialogsForGoto = (entity, gotoTargets) => {
    const dialogs = gotoTargets.map(target => {
        return extractADialog(entity.statements, target)
    })
    return dialogs
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
