import React, { useState, useMemo } from 'react'
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'
import { v4 as uuid } from 'uuid'

const useLocal = (key, initial) => {
  const [v, setV] = useState(() => {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : initial
  })
  React.useEffect(() => localStorage.setItem(key, JSON.stringify(v)), [key, v])
  return [v, setV]
}

const Input = (props) => <input {...props} style={{padding:8,border:'1px solid #ddd',borderRadius:8,width:'100%'}}/>
const Select = (props) => <select {...props} style={{padding:8,border:'1px solid #ddd',borderRadius:8,width:'100%'}}/>
const Card = ({children}) => <div style={{border:'1px solid #eee',borderRadius:16,padding:16,boxShadow:'0 2px 8px rgba(0,0,0,0.04)',background:'#fff'}}>{children}</div>
const Container = ({children}) => <div style={{maxWidth:960,margin:'24px auto',padding:16}}>{children}</div>
const Row = ({children}) => <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16}}>{children}</div>
const Label = ({children}) => <label style={{fontSize:12,opacity:.7,marginBottom:6,display:'block'}}>{children}</label>
const Btn = ({children, ...p}) => <button {...p} style={{padding:'10px 14px',borderRadius:12,border:'1px solid #ddd',cursor:'pointer',background:'#111',color:'#fff'}}>{children}</button>

const sample = [
  { id: uuid(), title: '2BHK in Indiranagar', city: 'Bengaluru', type: 'Apartment', price: 65000, img: 'https://picsum.photos/seed/apt/640/360', description: 'Near metro, semi-furnished.' },
  { id: uuid(), title: 'Studio in Andheri', city: 'Mumbai', type: 'Studio', price: 28000, img: 'https://picsum.photos/seed/studio/640/360', description: 'Compact studio, ideal for singles.' },
  { id: uuid(), title: 'Villa in Noida', city: 'Noida', type: 'Villa', price: 145000, img: 'https://picsum.photos/seed/villa/640/360', description: 'Spacious 4BHK with garden.' },
]

export default function App(){
  const [items, setItems] = useLocal('props.data', sample)
  const [q, setQ] = useState({city:'', type:'', min:'', max:''})
  const nav = useNavigate()

  const filtered = useMemo(() => items.filter(p => {
    const byCity = q.city ? p.city.toLowerCase().includes(q.city.toLowerCase()) : true
    const byType = q.type ? p.type === q.type : true
    const byMin = q.min ? p.price >= Number(q.min) : true
    const byMax = q.max ? p.price <= Number(q.max) : true
    return byCity && byType && byMin && byMax
  }), [items, q])

  return (
    <Container>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <h2>🏠 Property Finder</h2>
        <div style={{display:'flex',gap:8}}>
          <Btn onClick={()=>nav('/')}>List</Btn>
          <Btn onClick={()=>nav('/add')}>Add</Btn>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<>
          <Card>
            <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12}}>
              <div><Label>City</Label><Input placeholder="e.g., Bengaluru" value={q.city} onChange={e=>setQ({...q,city:e.target.value})}/></div>
              <div><Label>Type</Label>
                <Select value={q.type} onChange={e=>setQ({...q,type:e.target.value})}>
                  <option value="">Any</option>
                  <option>Apartment</option>
                  <option>Studio</option>
                  <option>Villa</option>
                  <option>Independent House</option>
                </Select>
              </div>
              <div><Label>Min Price</Label><Input type="number" value={q.min} onChange={e=>setQ({...q,min:e.target.value})}/></div>
              <div><Label>Max Price</Label><Input type="number" value={q.max} onChange={e=>setQ({...q,max:e.target.value})}/></div>
              <div style={{display:'flex',alignItems:'end'}}><Btn onClick={()=>setQ({city:'',type:'',min:'',max:''})}>Reset</Btn></div>
            </div>
          </Card>
          <Spacer h={16}/>
          <Row>
            {filtered.map(p => <PropertyCard key={p.id} p={p} onOpen={()=>nav(`/p/${p.id}`)} />)}
          </Row>
        </>} />
        <Route path="/add" element={<AddForm onAdd={(x)=>{ setItems([x, ...items]); nav('/'); }}/>} />
        <Route path="/p/:id" element={<Detail items={items}/>} />
      </Routes>
    </Container>
  )
}

const Spacer = ({h=8}) => <div style={{height:h}}/>

function PropertyCard({p, onOpen}){
  return (
    <Card>
      <img src={p.img} alt={p.title} style={{width:'100%', borderRadius:12, aspectRatio:'16/9', objectFit:'cover'}}/>
      <h3 style={{margin:'12px 0 4px'}}>{p.title}</h3>
      <div style={{opacity:.7}}>{p.city} • {p.type}</div>
      <div style={{margin:'8px 0', fontWeight:'bold'}}>₹ {p.price.toLocaleString('en-IN')}</div>
      <Btn onClick={onOpen}>View</Btn>
    </Card>
  )
}

function AddForm({onAdd}){
  const [f, setF] = React.useState({title:'',city:'',type:'Apartment',price:'',img:'',description:''})
  return (
    <Card>
      <h3>Add Property</h3>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Field label="Title" v={f.title} onChange={v=>setF({...f,title:v})}/>
        <Field label="City" v={f.city} onChange={v=>setF({...f,city:v})}/>
        <Field label="Type" as="select" v={f.type} onChange={v=>setF({...f,type:v})} options={['Apartment','Studio','Villa','Independent House']}/>
        <Field label="Price (INR)" type="number" v={f.price} onChange={v=>setF({...f,price:v})}/>
        <Field label="Image URL" v={f.img} onChange={v=>setF({...f,img:v})}/>
      </div>
      <div style={{marginTop:12}}>
        <Label>Description</Label>
        <textarea value={f.description} onChange={e=>setF({...f,description:e.target.value})} style={{width:'100%',minHeight:100,padding:8,border:'1px solid #ddd',borderRadius:8}}/>
      </div>
      <Spacer h={12}/>
      <Btn onClick={()=>{
        if(!f.title || !f.city || !f.price) return alert('Please fill Title, City, and Price')
        onAdd({ ...f, id: uuid(), price: Number(f.price) })
      }}>Save</Btn>
    </Card>
  )
}

function Field({label, v, onChange, as='input', options=[], type='text'}){
  return (
    <div>
      <Label>{label}</Label>
      {as==='select' ? (
        <select value={v} onChange={e=>onChange(e.target.value)} style={{padding:8,border:'1px solid #ddd',borderRadius:8,width:'100%'}}>
          {options.map(o=> <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <Input type={type} value={v} onChange={e=>onChange(e.target.value)} />
      )}
    </div>
  )
}

function Detail({items}){
  const { id } = useParams()
  const p = items.find(x => x.id === id)
  const nav = useNavigate()
  if(!p) return <Card><p>Not found.</p><Btn onClick={()=>nav('/')}>Back</Btn></Card>
  return (
    <Card>
      <img src={p.img} alt={p.title} style={{width:'100%', borderRadius:12, aspectRatio:'16/9', objectFit:'cover'}}/>
      <h2 style={{margin:'12px 0 4px'}}>{p.title}</h2>
      <div style={{opacity:.7}}>{p.city} • {p.type}</div>
      <div style={{margin:'8px 0', fontWeight:'bold'}}>₹ {p.price.toLocaleString('en-IN')}</div>
      <p>{p.description}</p>
      <Btn onClick={()=>window.history.back()}>Back</Btn>
    </Card>
  )
}
