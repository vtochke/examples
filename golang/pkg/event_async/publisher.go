package event_async

import (
	"log"
	"sync"
)

type (
	Publisher struct {
		Name        string
		Subscribers []*Subscriber
		inMsg       chan Message
		mutex       sync.RWMutex // lock
	}
	Message struct {
		Data map[string]interface{}
	}
)

func (p *Publisher) publishMessage(m Message) {
	p.mutex.RLock()
	defer p.mutex.RUnlock()
	log.Println(m)
	p.inMsg <- m
}

func (p *Publisher) Stop() {
	close(p.inMsg)
}

func (p *Publisher) start() {
	for {
		if msg, ok := <-p.inMsg; ok {
			log.Println(msg)
			for _, sub := range p.Subscribers {
				sub.Notify(msg)
			}
		}
	}
	/*select {
	case msg := <-p.inMsg:
		log.Println(msg)
		for _, sub := range p.Subscribers {
			sub.Notify(msg)
		}
	default:
		// pass
		log.Println("pass")
	}*/
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
