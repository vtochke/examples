package event_async

import (
	"fmt"
)

var Publishers = make(map[string]*Publisher)

func AddSubscriber(name string, s *Subscriber) {
	if pub, exist := Publishers[name]; exist {
		pub.Subscribers = append(pub.Subscribers, s)
	}
}

func PublishMessage(name string, m Message) {
	pub := NewPublisher(name)
	go func(p *Publisher) {
		p.publishMessage(m)
	}(pub)
}

func Listen() {
	for _, pub := range Publishers {
		go pub.Start()
	}

	fmt.Scanln()
	fmt.Println("Done!")
}
