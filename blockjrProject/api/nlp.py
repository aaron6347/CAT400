from bs4 import BeautifulSoup
from fuzzywuzzy import fuzz
from math import floor, ceil, sqrt, sin, cos, tan, asin, acos, atan, log, log10, exp, pow
from random import uniform

# extract xml, do translation or transform into string for display, storing and evaluation
def nlpmain(workspace, functionality):
    extractionData = []
    soup = BeautifulSoup(workspace, "lxml")
    xml = soup.findChild("xml")
    # traverse and extract each disjunction block
    for each in xml:
        if each.name == "block":
            extractionData.append(xml_traversal(each))
    # perform translation and transformation of extracted data into string
    if functionality == "both":
        string1 = translation(extractionData)
        string2 = transformation(extractionData)
        return string1, string2
    # translate extracted data into string for display
    elif functionality == "translation":
        return translation(extractionData)
    # transform extracted data into string for storing and evaluation
    elif functionality == "transformation":
        return transformation(extractionData)


# traverse xml
def xml_traversal(block):
    blockList = []  # to save all block within stack
    # traverse the stack
    while(block != None and block.name == "block"):
        # extract <block> info
        action = get_block(block)
        # extract <value>/<field> info
        detailList = []
        for each in block:
            if each.name == "value":
                detailList.extend(get_value(each))
            if each.name == "field":
                detailList.append(get_field(each))
            if each.name == "statement":
                detailList.append(xml_traversal(each.findChild("block")))
        # saving stack's extraction
        blockList.append([action, *detailList])
        # merge certain duplicate block
        if len(blockList) > 1:
            merged = check_duplicate(blockList[len(blockList)-2], blockList[len(blockList)-1])
            if merged != False and type(merged) is list:
                blockList.pop()
                blockList.pop()
                blockList.append(merged)
        # try to traverse to the next <block>
        newBlock = block.findChild("next")
        if newBlock != None:
            # skip <next> that exist in <statement> (substack)
            statementBlock = block.findChild("statement")
            if statementBlock != None:
                if statementBlock.findChild("next") == newBlock:
                    newBlock = block.findChild("statement").find_next_sibling("next")
            if newBlock != None:
                block = newBlock.findChild("block")
            else:
                block = None
        else:
            block = None
    return blockList

# extract <block> type
def get_block(block):
    return block["type"]

# extract <value> info
def get_value(block):
    # if the <value> is <block>
    if block.findChild("block") != None:
        action = get_block(block.findChild("block"))
        collection = [action]
        for each in block.findChild("block"):
            if each.name == "value":
                collection.extend(get_value(each))
            if each.name == "field":
                collection.append(get_field(each))
        # if the <block> is an operator with 2 input
        if len(collection) > 2 and collection[-2] != "None" and collection[-1] != "None":
            input1 = collection.pop(-2)
            input2 = collection.pop(-1)
            if action == "operator_add":
                try:
                    return [float(input1)+float(input2)]
                except:
                    return [input1, input2]
            elif action == "operator_subtract":
                try:
                    return [float(input1)-float(input2)]
                except:
                    return [input1, input2]
            elif action == "operator_multiply":
                try:
                    return [float(input1)*float(input2)]
                except:
                    return [input1, input2]
            elif action == "operator_divide":
                try:
                    return [float(input1)/float(input2)]
                except:
                    return [input1, input2]
            elif action == "operator_random":
                try:
                    return [uniform(float(input1), float(input2))]
                except:
                    return [input1, input2]
            elif action == "operator_lt":
                try:
                    return [float(input1) < float(input2)]
                except:
                    return [input1 < input2]
            elif action == "operator_equals":
                return [input1 == input2]
            elif action == "operator_gt":
                try:
                    return [float(input1) > float(input2)]
                except:
                    return [input1 > input2]
            elif action == "operator_and":
                return [input1 and input2]
            elif action == "operator_or":
                return [input1 or input2]
            elif action == "operator_join":
                return [input1+input2]
            elif action == "operator_letter_of":
                index = int(input1)
                string = input2
                if index > len(string)-1:
                    return [None]
                else:
                    return [string[index]]
            elif action == "operator_contains":
                return [input2 in input1]
            elif action == "operator_mod":
                return [float(input1)%float(input2)]
            elif action == "operator_mathop":
                if input1 == "abs":
                    return [abs(float(input2))]
                elif input1 == "floor":
                    return [floor(float(input2))]
                elif input1 == "ceiling":
                    return [ceil(float(input2))]
                elif input1 == "sqrt":
                    return [sqrt(float(input2))]
                elif input1 == "sin":
                    return [sin(float(input2))]
                elif input1 == "cos":
                    return [cos(float(input2))]
                elif input1 == "tan":
                    return [tan(float(input2))]
                elif input1 == "asin":
                    return [asin(float(input2))]
                elif input1 == "acos":
                    return [acos(float(input2))]
                elif input1 == "atan":
                    return [atan(float(input2))]
                elif input1 == "ln":
                    return [log(float(input2))]
                elif input1 == "log":
                    return [log10(float(input2))]
                elif input1 == "e ^":
                    return [exp(float(input2))]
                elif input1 == "10 ^":
                    return [pow(10, float(input2))]
        # if the <block> is an operator with 1 input
        elif len(collection) > 1 and collection[-1] != None:
            if action == "operator_not":
                return [not collection.pop(-1)]
            elif action == "operator_length":
                return [len(collection.pop(-1))]
            elif action == "operator_round":
                return [round(float(collection.pop(-1)))]
        return collection
    # if the <value> is <field>
    elif block.findChild("field") != None:
        return [get_field(block.findChild("field"))]

# extract <field> input
def get_field(block):
    return str(block.string)


# check duplicate by differentiating additive, non-additive, control block
def check_duplicate(prevBlock, currBlock):
    additiveBlock = ["motion_movesteps", "motion_turnright", "motion_turnleft", "motion_changexby", "motion_changeyby", "looks_changesizeby", "sound_changevolumeby", "control_wait"]
    semiAdditiveBlock = {"motion_glidesecstoxy" : 1, "motion_glideto" : 1, "looks_changeeffectby": 2, "looks_goforwardbackwardlayers" : 2, "sound_changeeffectby" : 2}
    # controlBlock = ["control_repeat", "control_if", "control_if_else", "control_repeat_until"]
    if prevBlock[0] == currBlock[0] and len(prevBlock) == len(currBlock) and (prevBlock[0] in additiveBlock or prevBlock[0] in semiAdditiveBlock):
        if prevBlock[0] in additiveBlock:
            newBlock = additive_duplicate(prevBlock, currBlock)
        elif prevBlock[0] in semiAdditiveBlock:
            newBlock = semiAdditive_duplicate(prevBlock, currBlock, semiAdditiveBlock[prevBlock[0]])
        return newBlock
    else:
        return False

# check duplicate by merging additive input
def additive_duplicate(prevBlock, currBlock):
    newBlock = [prevBlock[0]]
    for index in range(1, len(prevBlock)):
        try:
            if prevBlock[index] != None and currBlock[index] != None and float(prevBlock[index]) and float(currBlock[index]):
                newBlock.append(str(float(prevBlock[index])+float(currBlock[index])))
        except:
            return False
    return newBlock

# check duplicate by merging additive input while comparing non-additive input
def semiAdditive_duplicate(prevBlock, currBlock, additiveIndex):
    newBlock = [prevBlock[0]]
    for index in range(1, len(prevBlock)):
        try:
            if index == additiveIndex and prevBlock[index] != None and currBlock[index] != None and float(prevBlock[index]) and float(currBlock[index]):
                newBlock.append(str(float(prevBlock[index])+float(currBlock[index])))
            elif index != additiveIndex and type(prevBlock[index]) == type(currBlock[index]) and prevBlock[index] == currBlock[index]:
                newBlock.append(prevBlock[index])
            else:
                return False
        except:
            return False
    return newBlock


# perform translation of data into string
def translation(extractionData):
    string = ""
    for index, stack in enumerate(extractionData):
        stackString = stack_translation(stack, ". ")
        if index != len(extractionData) -1:
            string += stackString + ".\n\nNext "
        else:
            string += stackString + "."
    return string

# translate stack list into string
def stack_translation(stack, separator):
    string = []
    for block in stack:
        string.append(block_translation(block))
    return "{}".format(separator).join(string)

# translate block list into string
def block_translation(block):
    # controlBlock = ["control_repeat", "control_forever", "control_if", "control_if_else", "control_repeat_until"]
    string = block[0][block[0].rindex("_")+1:]
    for index in range(1, len(block)):
        if type(block[index]) is list:
            newString = stack_translation(block[index], ", ")
            string += " (" + newString + ")"
        else:
            string += " " + str(block[index])
    return string


# perform transformation of data to string
def transformation(extractionData):
    string = ""; inputs = []
    for index, stack in enumerate(extractionData):
        stackString, newInputs = stack_transformation(stack, ". ")
        inputs.extend(newInputs)
        if index != len(extractionData) -1:
            string += stackString + ". Next "
        else:
            string += stackString + "."
    return string + "[{}]".format(", ".join(inputs))

# transform stack list into string and input
def stack_transformation(stack, separator):
    actions = []; inputs = []
    for block in stack:
        newActions, newInputs = block_transformation(block)
        actions.append(newActions)
        inputs.extend(newInputs)
    return "{}".format(separator).join(actions), inputs

# transform block list into string and input
def block_transformation(block):
    # controlBlock = ["control_repeat", "control_forever", "control_if", "control_if_else", "control_repeat_until"]
    string = block[0][block[0].rindex("_")+1:]; inputs = []
    for index in range(1, len(block)):
        if type(block[index]) is list:
            newActions, newInputs = stack_transformation(block[index], ", ")
            string += " (" + newActions + ")"
            inputs.extend(newInputs)
        else:
            inputs.append(str(block[index]))
    return string, inputs


# evaluate student's submission with teacher's solution
def evaluation(submission, solution):
    # divide into action and input
    studentAction = submission[:submission.rindex("[")]
    studentInput = submission[submission.rindex("[")+1:-1].split(", ")
    teacherAction = solution[:solution.rindex("[")]
    teacherInput = solution[solution.rindex("[")+1:-1].split(", ")
    # evaluate action and input separately
    actionScore, actionMismatch = evaluate_action(studentAction, teacherAction)
    inputScore, inputMismatch = evaluate_input(studentInput, teacherInput)
    score = actionScore*0.6+inputScore*0.4
    if actionMismatch == "" and inputMismatch == "":
        feedback = "Voila, you got this under your belt!"
    elif actionMismatch in ("more blocks", "less blocks") and inputMismatch in ("more inputs", "less inputs"):
        feedback = "There are {} and {} than expected.".format(actionMismatch, inputMismatch)
    elif actionMismatch in ("more blocks", "less blocks"):
        feedback = "There are {} than expected. {}".format(actionMismatch, inputMismatch)
    elif inputMismatch in ("more inputs", "less inputs"):
        feedback = "{} There are {} than expected.".format(actionMismatch, inputMismatch)
    else:
        feedback = "{} {}".format(actionMismatch, inputMismatch)
    return score, feedback

# evaluate block actions
def evaluate_action(studentAction, teacherAction):
    # fuzzy wuzzy
    score = fuzz.ratio(studentAction, teacherAction)
    # exact matching
    matchCount = 0; mismatchCount = 0; mismatch = ""
    studentActionList = studentAction.split(" ")
    teacherActionList = teacherAction.split(" ")
    minLength = min(len(studentActionList), len(teacherActionList))
    for index in range(minLength):
        if teacherActionList[index] == "Next" and studentActionList[index] != "Next":
            mismatchCount += 1
            if mismatch == "":
                mismatch = "\"{}\" should be disconnected and placed as a new stack of block.".format(studentActionList[index].translate(str.maketrans('', '', ',.)(')))
        elif studentActionList[index] == teacherActionList[index]:
            matchCount += 1
        else:
            mismatchCount += 1
            if mismatch == "":
                mismatch = "You might want to use other block than \"{}\".".format(studentActionList[index].translate(str.maketrans('', '', ',.)(')))
    if mismatch == "" and len(studentAction) > len(teacherAction):
        mismatch = "more blocks"
    elif mismatch == "" and len(studentAction) < len(teacherAction):
        mismatch = "less blocks"
    # normalized score of fuzzy with exact matching
    return score*0.8+(matchCount/(mismatchCount+matchCount))*20, mismatch

# evaluate input
def evaluate_input(studentInput, teacherInput):
    score = 0; mismatch = ""
    minLength = min(len(studentInput), len(teacherInput))
    for index in range(minLength):
        try:
            # if inputs are same numbers
            if studentInput[index] != None and teacherInput[index] != None and float(studentInput[index]) == float(teacherInput[index]):
                score += 100
            # if input are not same numbers
            else:
                if mismatch == "":
                    if float(studentInput[index]) > float(teacherInput[index]):
                        mismatch = "Please decrease the value of \"{}\".".format(studentInput[index])
                    else:
                        mismatch = "Please increase the value of \"{}\".".format(studentInput[index])
                score += max(0, 100-abs(float(teacherInput[index])-float(studentInput[index])))
        except:
            # if inputs are the same but not numbers
            if studentInput[index] == teacherInput[index]:
                score += 100
            # if inputs are not the same and not numbers
            else:
                if mismatch == "":
                    mismatch = "Please change the input of \"{}\".".format(studentInput[index])
                score += fuzz.ratio(studentInput[index], teacherInput[index])
    if mismatch == "" and len(studentInput) > len(teacherInput):
        mismatch = "more inputs"
    elif mismatch == "" and len(studentInput) < len(teacherInput):
        mismatch = "less inputs"
    # normalized score of input corresponds to the amount of input
    return score/max(len(studentInput), len(teacherInput)), mismatch
