const lintScenario = {}
export default lintScenario

const lintScenarioForUPILOutput = (scenario) => {
    let warnings = []
    let errors = []

    scenario = scenario.sort((thisElem, thatElem) => {
        const { num: a } = thisElem
        const { num: b } = thatElem
        if (a < b) { return -1 }
        else if (a === b) { return 0 }
        else { return 1 }
    })

    for (const node of scenario) {
        console.log(JSON.stringify(node, null, 2))

        let result = {}
        const { num, type } = node
        switch (type) {
            case 'start-point':
                result = lintStartPoint(node, scenario)
                break
            case 'normal':
                result = lintNormal(node, scenario)
                break
            case 'openquestion':
                result = lintOpenQuestion(node, scenario)
                break
            case 'selection':
                result = lintSelection(node, scenario)
                break
            case 'goto':
                result = lintGoTo(node, scenario)
                break
            case 'media':
                result = lintMedia(node, scenario)
                break
            default:
                result = { warnings: [], errors: [error(num, `Unknown type: ${type}`)] }
        }
        warnings = warnings.concat(result.warnings)
        errors = errors.concat(result.errors)
    }

    const result = errors.length === 0 ? { result: 'success', warnings } : { result: 'fail', warnings, errors }

    console.log(JSON.stringify(result, null, 2))

    return result
}

const lintStartPoint = (node, scenario) => {
    let result = { warnings: [], errors: [] }

    let { num, conditions } = node
    conditions = conditions === undefined ? [] : conditions
    for (const condition of conditions) {
        const { type, option, next } = condition
        if (type === 'custom_var' && option === undefined) {
            const toNode = getNodeFromId(next, scenario)
            result.errors.push(error(num, `UPIL export needs edge Start -> ${toNode.num} to have a custom variable. Add one.`))
        } else if (type === 'default') {
            const toNode = getNodeFromId(next, scenario)
            result.errors.push(error(num, `UPIL export needs edge Start -> ${toNode.num} to have a custom variable. Add one.`))
        }
    }

    return result
}

const lintNormal = (node, scenario) => {
    let result = { warnings: [], errors: [] }

    let { num, customAction, conditions } = node
    conditions = conditions === undefined ? [] : conditions
    for (const condition of conditions) {
        const { type, option, next } = condition
        if (type === 'custom_var' && option === undefined) {
            const toNode = getNodeFromId(next, scenario)
            result.errors.push(error(num, `UPIL export needs edge ${num} -> ${toNode.num} to have a custom variable. Add one.`))
        } else if (type === 'default') {
            const toNode = getNodeFromId(next, scenario)
            result.errors.push(error(num, `UPIL export needs edge ${num} -> ${toNode.num} to have a custom variable. Add one.`))
        }
    }

    if (customAction !== undefined) {
        result.warnings.push(warning(num, `UPIL export does not support Custom Action. Ignored.`))
    }

    return result
}

const lintOpenQuestion = (node, scenario) => {
    let result = { warnings: [], errors: [] }

    const { num, customVariable, customAction } = node
    if (customVariable === undefined) {
        result.errors.push(error(num, `UPIL export needs Open Question to have a custom variable. Add one.`))
    } else if (customVariable.location === '') {
        result.errors.push(error(num, `Open Question's custom variable is missing a location. Add one.`))
    }
    if (customAction !== undefined) {
        result.warnings.push(warning(node.num, `UPIL export does not support Custom Action. Ignored.`))
    }

    return result
}

const lintSelection = (node, scenario) => {
    let result = { warnings: [], errors: [] }

    const { num, customVariable, customAction } = node
    if (customVariable === undefined) {
        result.errors.push(error(num, `UPIL export needs Selection to have a custom variable. Add one.`))
    } else if (customVariable.location === '') {
        result.errors.push(error(num, `Selection's custom variable is missing a location. Add one.`))
    }
    if (customAction !== undefined) {
        result.warnings.push(warning(node.num, `UPIL export does not support Custom Action. Ignored.`))
    }

    return result
}

const lintGoTo = (node, scenario) => {
    let result = { warnings: [], errors: [] }

    // Nothing to check

    return result
}

const lintMedia = (node, scenario) => {
    let result = { warnings: [], errors: [] }

    // Nothing to check

    return result
}

const warning = (num, mess) => {
    return `[Node ${num}] ${mess}`
}

const error = (num, mess) => {
    return `[Node ${num}] ${mess}`
}

const getNodeFromId = (id, scenario) => {
    return scenario.find(node => {
        return id === node.id
    })
}

window.lintScenarioForUPILOutput = lintScenarioForUPILOutput
