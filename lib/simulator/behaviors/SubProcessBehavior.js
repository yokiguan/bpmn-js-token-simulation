import {
  is
} from './ModelUtil';


export default function SubProcessBehavior(
    simulator,
    activityBehavior,
    scopeBehavior,
    elementRegistry) {

  this._simulator = simulator;
  this._activityBehavior = activityBehavior;
  this._scopeBehavior = scopeBehavior;
  this._elementRegistry = elementRegistry;

  simulator.registerBehavior('bpmn:SubProcess', this);
  simulator.registerBehavior('bpmn:Transaction', this);
  simulator.registerBehavior('bpmn:AdHocSubProcess', this);
}

SubProcessBehavior.prototype.signal = function(context) {
  this.enter(context);
};

SubProcessBehavior.prototype.enter = function(context) {

  const {
    element,
    startEvent = this.findSubProcessStart(element),
    scope
  } = context;

  if (!startEvent) {
    throw new Error('missing <startEvent>');
  }

  this._simulator.signal({
    element: startEvent,
    parentScope: scope
  });
};

SubProcessBehavior.prototype.exit = function(context) {

  const {
    scope,
    initiator
  } = context;

  this._activityBehavior.exit(context);

  const {
    parent: scopeParent
  } = scope;

  if (this._scopeBehavior.isFinished(scopeParent, scope)) {
    this._scopeBehavior.exit({
      scope: scopeParent,
      initiator
    });
  }
};

SubProcessBehavior.prototype.findSubProcessStart = function(element) {
  return this._elementRegistry.find(
    el => {
      var bo = el.businessObject;
      return bo && bo.$parent && bo.$parent.id === element.id && is(el, 'bpmn:StartEvent');
    }
  );
};

SubProcessBehavior.$inject = [
  'simulator',
  'activityBehavior',
  'scopeBehavior',
  'elementRegistry'
];


