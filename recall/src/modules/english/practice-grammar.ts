type GrammarCard = readonly [prompt:string,answer:string,incorrect:string,other:string,explanation:string];

// Each row follows the four grammar targets taught in that course week.
export const practiceGrammar:readonly (readonly GrammarCard[])[]=[
  [
    ['The receptionist ___ the schedule every morning.','checks','check','checking','Use checks with the singular subject the receptionist.'],
    ['How often ___ the clinic send reminders?','does','do','is','Start the question with does before a singular subject, then use the base verb send.'],
    ['We ___ extra chairs before each workshop.','need','needs','needing','Use the base form need with we in the present simple.'],
    ['Maya ___ at the library on Fridays.','works','work','working','Add -s to works because Maya is one person.'],
  ],
  [
    ['Last Tuesday we ___ the two branches.','merged','merge','merging','Use the past simple for a completed event at a stated past time.'],
    ['Why did the scanner ___ during class?','fail','failed','failing','Use the base form fail after did.'],
    ['I ___ the setup notes after yesterday’s meeting.','updated','update','have update','Use updated for a completed past action.'],
    ['We ___ remove any fields during last night’s release.',"didn't","doesn't","weren't",'Use did not followed by the base form remove for a past negative.'],
  ],
  [
    ['At noon yesterday we ___ the new booking page.','deployed','have deployed','deploy','Use deployed with a finished past time such as at noon yesterday.'],
    ['You can sign in now: we ___ the missing permission.','have added','has added','adding','Use have with we and a past participle to connect the action to the result now.'],
    ['___ you sent the new link yet?','Have','Has','Are','Use have with you before the past participle sent.'],
    ['The archive job ___ at 8 pm last Friday.','failed','has failed','failing','Use failed for a completed event with a specific past time.'],
  ],
  [
    ['Could you explain what the scanner ___?','reads','does it read','read','Use statement word order and reads with the singular subject the scanner.'],
    ['What ___ this warning mean?','does','do','is','Use does before the singular subject and mean in its base form.'],
    ['Do you know why the printer ___ yesterday?','stopped','did it stop','does stop it','Use statement word order and the past tense inside the indirect question.'],
    ['___ you show me the quickest way to export a PDF?','Could','Must to','Do to','Could you is a polite way to ask someone to do something.'],
  ],
  [
    ['With the new form, users make ___ mistakes than before.','fewer','much','a little','Use fewer with countable plural nouns such as mistakes.'],
    ['This export takes ___ time than printing each page.','less','fewer','many','Use less with the uncountable noun time.'],
    ['The replacement cable is longer ___ the old one.','than','then','as','Use than after the comparative adjective longer.'],
    ['A second review can be ___ useful than another warning.','more','most','many','Use more to make the comparative more useful.'],
  ],
  [
    ['I can hear Eva now. She ___ to the client at this moment.','is speaking','is speak','are speaking','Use is and the -ing form for an action in progress with she.'],
    ['Our printer usually ___ two copies of each receipt.','prints','is print','printing','Use the present simple prints for a regular action with a singular subject.'],
    ['Please wait. We ___ the cable now.','are replacing','is replacing','are replace','Use are and the -ing form after we to describe the action in progress.'],
    ['The timetable ___ every Monday.','changes','change','is change','Use changes for a recurring action with a singular subject.'],
  ],
  [
    ['If the room fills up, we ___ move to a larger one.','can','to','would to','Use can followed by the base form move.'],
    ['If you ___ the notes today, I’ll check them tomorrow.','send','sends','will sends','Use the present simple send in this if-clause with you.'],
    ['I’ll call you as soon as the parcel ___.','arrives','will arrives','arriving','Use the present simple in this future time clause after as soon as.'],
    ['If the lift stops, you ___ use the stairs.','must','must to','musts','Use must followed directly by the base form use.'],
  ],
  [
    ['We changed the meeting time ___ the room was already booked.','because','because of','despite','Use because before a clause with its own subject and verb.'],
    ['___ the first draft is short, it covers the main point.','Although','Because of','Despite of','Use although before a clause that sets up a contrast.'],
    ['The delivery was late because of ___.','getting stuck in traffic','get stuck in traffic','got stuck in traffic','Use the -ing form getting after because of.'],
    ['The second option costs more. ___, it saves an hour each week.','However','Because of','Despite of','Use however to contrast the second sentence with the first.'],
  ],
  [
    ['The file ___ still be in the shared folder. I haven’t checked yet.','might','must to','is','Use might plus the base verb to express a possibility.'],
    ['We ___ compare two receipts before reporting an error.','should','should to','shoulds','Use should directly before the base form compare.'],
    ['A single review ___ show what most people think.','does not','not','is not','Use does not before the base verb show.'],
    ['The loose cable could ___ causing the display problem.','be','is','being','Use the base form be after could.'],
  ],
  [
    ['Each visitor pass ___ printed at the front desk.','is','does','has','Use is plus the past participle printed for a singular subject in a present passive.'],
    ['The main entrance was ___ for repairs.','closed','close','closing','Use the past participle closed after was to form the passive.'],
    ['The rooms ___ cleaned every evening.','are','is','be','Use are before the past participle with the plural subject rooms.'],
    ['This photo ___ taken last Saturday.','was','is been','has','Use was taken in the passive for a specific finished time.'],
  ],
  [
    ['Staff ___ share a customer’s address in the public chat. It’s forbidden.','must not','do not have to','may to','Use must not for an action that is forbidden.'],
    ['A ticket is optional. You ___ buy one to enter.','do not have to','must not','cannot to','Use do not have to for something that is optional.'],
    ['Every visitor ___ show a pass at the door.','must','musts','must to','Must has the same form after every subject and takes the base verb show.'],
    ['We should ___ the address before sending the parcel.','check','checking','to check','Use the base form check after should.'],
  ],
  [
    ['If we rented a larger room, we ___ have more space.','would','will to','would to','Use would for the result of the hypothetical situation.'],
    ['If the courier ___ late, we might miss the deadline.','arrived','arrives to','would arrived','Use the past simple in this hypothetical if-clause.'],
    ['We could save time by ___ the documents in advance.','printing','print','printed','Use the -ing form after by to explain how to achieve the result.'],
    ['We would walk to work if we ___ closer.','lived','would live','lives','Use the past simple lived in the hypothetical if-clause.'],
  ],
];
