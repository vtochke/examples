package event_async

type (
	Publisher struct {
		Name        string
		Subscribers []*Subscriber
		inMsg       chan Message
	}
	Message struct {
		Data map[string]interface{}
	}
)

func (p *Publisher) publishMessage(m Message) {
	p.inMsg <- m
}

func (p *Publisher) Stop() {
	close(p.inMsg)
}

func (p *Publisher) Start() {
	for msg := range p.inMsg {
		for _, sub := range p.Subscribers {
			sub.Notify(msg)
		}
	}
}

func NewPublisher(name string) *Publisher {
	if _, exist := Publishers[name]; !exist {
		em := &Publisher{
			Name:  name,
			inMsg: make(chan Message),
		}

		Publishers[name] = em
	}

	return Publishers[name]
}
